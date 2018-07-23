/*
 * MIT License
 * 
 * Copyright (c) 2018 Prasen Palvankar1
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Created Date: Wednesday, July 18th 2018, 09:06:38 am
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sun Jul 22 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import { promisifiedReadFile, Constants, Settings } from '../common/common';
import * as log4js from 'log4js';
import { Database } from "sqlite3";

const EVENTS_TABLE_NAME = 'RPI_EVENT_TABLE';

/**
 * Log events
 * 
 * @export
 * @class EventLogger
 */
export class EventLogger {

    private static instance: EventLogger;
    private logger: log4js.Logger;
    private eventsDB: Database;

    constructor() {
        this.logger = log4js.getLogger('EventLogger');
    }

    public static getInstance(): EventLogger {
        if (!EventLogger.instance) {
            EventLogger.instance = new EventLogger();
        }
        return EventLogger.instance;
    }

    private openDB(): Promise<Database> {
        this.logger.debug('openDB()');
        return new Promise((resolve, reject) => {
            let db = new Database(Constants.eventLogDBName, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(db);
                }
            });
        });
    }

    private checkTableExists(): Promise<boolean> {
        this.logger.debug('checkTableExists()');
        return new Promise((resolve, reject) => {
            this.eventsDB.get(`SELECT COUNT(*) AS count FROM sqlite_master WHERE name='${EVENTS_TABLE_NAME}'`,
                (err, rows) => {
                    if (err) {
                        let e = new Error(err.message);
                        e.name = 'Failed check events table existence';
                        this.logger.error(e.name, e.message);
                        reject(e);
                    } else {
                        resolve(rows.count > 0);
                    }

                });
        });
    }

    private async createTable() {
        this.logger.debug('createTable()');
        return new Promise((resolve, reject) => {
            this.eventsDB.run(`CREATE TABLE ${EVENTS_TABLE_NAME} (event_time integer, event_type text, event_source, event_text text, device_id text ) `, [], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        });
    }

    async init() {
        this.logger.debug('init()');
        try {
            this.eventsDB = await this.openDB();
            let tableExists = await this.checkTableExists();
            if (!tableExists) {
                await this.createTable();
            }
        } catch (err) {
            this.logger.error(`Failed to init events DB ${err}`);
            this.logger.error(err);
            throw err;
        }

    }

    public addEvent(event: Event): Promise<void> {
        this.logger.debug('addEvent()');
        return new Promise((resolve, reject) => {
            this.eventsDB.run(`INSERT INTO ${EVENTS_TABLE_NAME} (event_time, event_type, event_source, event_text, device_id) VALUES ($eventTime, $eventType, $eventSource, $eventText, $deviceId)`,
                {
                    $eventTime: event.eventTime,
                    $eventType: event.type,
                    $eventText: event.text,
                    $deviceId: event.deviceId,
                    $eventSource: event.eventSource
                }, (err) => {
                    if (err) {
                        this.logger.error('Failed to insert event into table');
                        this.logger.error(err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
        });
    }

    public getEvents(queryOptions?: EventQueryOptions): Promise<Array<Event>> {
        return new Promise((resolve, reject) => {
            let eventList = new Array<Event>();
            let filters = new Array<string>();
            let queryParams:{
                $dateFrom?: number,
                $dateTo?: number,
                $deviceId?: string,
                $eventSource?: string,
                $eventType?: string             
            } = {};

            let offset = '';
            let limit = '';
            
            // Build the where clause
            if (queryOptions) {
                if (queryOptions.dateRange) {                    
                    if (queryOptions.dateRange.from) {
                        filters.push('event_time BETWEEN $dateFrom AND $dateTo');
                        queryParams.$dateFrom = queryOptions.dateRange.from;
                        queryParams.$dateTo = queryOptions.dateRange.to;
                    } else {
                        filters.push('event_time < $dateTo');
                        queryParams.$dateTo = queryOptions.dateRange.to;
                    }
                }

                if (queryOptions.eventType) {
                    filters.push(`event_type = $eventType`);
                    queryParams.$eventType = queryOptions.eventType;
                }

                if (queryOptions.eventSource) {
                    filters.push(`event_source = $eventSource`);
                    queryParams.$eventSource = queryOptions.eventSource;
                }


                if (queryOptions.deviceId) {
                    filters.push(`device_id = $deviceId`);
                    queryParams.$deviceId = queryOptions.deviceId;
                }

                if (queryOptions.offset) {
                    offset = ` OFFSET ${queryOptions.offset}`;
                }

                if (queryOptions.limit) {
                    limit = ` LIMIT ${queryOptions.limit}`;
                }                
            }

            let whereClause = '';
            if (filters.length > 0) {
                whereClause = ` WHERE ${filters.join(' AND ')}`;
            }

            let sql = `SELECT * FROM ${EVENTS_TABLE_NAME} ${whereClause} ORDER BY EVENT_TIME DESC ${limit}  ${offset} `;
            this.logger.debug(`SQL ${sql}`);
            this.logger.debug('Query Params', queryParams);
            this.eventsDB.each(sql, queryParams,
                (err, row) => {
                    // Called back for each row retrieved
                    if (!err) {
                        eventList.push({
                            eventTime: row.event_time,
                            eventSource: row.event_source,
                            type: row.event_type,
                            text: row.event_text,
                            deviceId: row.device_id
                        });
                    } else {
                        this.logger.error('Error occured during fetch events');
                        this.logger.error(err);
                    }

                },
                () => {
                    resolve(eventList);
                });
        });
    }

}

export interface EventQueryOptions {
    dateRange?: {
        from?: number;
        to: number;
    };
    eventType?: string,
    eventSource?: string,
    deviceId?: string;
    offset?: number;
    limit: number;
}

/**
 * Event types
 *
 * @export
 * @enum {number}
 */
export enum EventTypes {
    INFO = "Info",
    WARNING = "Warning",
    ERROR = "Error"
};

/**
 * An event
 *
 * @export
 * @interface Event
 */
export interface Event {
    eventTime: number;
    eventSource: string;
    type: EventTypes;
    deviceId?: string;
    text: string;
}

