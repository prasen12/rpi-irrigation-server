import { Schedule } from './schedule-manager';
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
 * Created Date: Sunday, July 15th 2018, 05:43:15 pm
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sat Jul 28 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import * as node_schedule from "node-schedule";
import { readFile, writeFile } from 'fs';
import * as util from 'util';
import { Constants, promisifiedReadFile, promisifiedWriteFile } from "../common/common";
import * as log4js from "log4js";
import { IrrigationController } from '../controllers/irrigation-controller';

/**
 * A schedule
 *
 * @export
 * @interface Schedule
 */
export interface Schedule {
    name: string,
    description: string,
    deviceId: string,
    rule: node_schedule.RecurrenceRule,
    action: string,
    active: boolean,
    duration: number
};


/**
 * Singleton, Schedule manager 
 * 
 * @export
 * @class ScheduleManager
 */
export class ScheduleManager {
    private schedules: Map<string, Schedule>;
    private logger: log4js.Logger;
    private scheduledJobs: Map<string, node_schedule.Job>;
    static instance: ScheduleManager;
    private irrigationController: IrrigationController;

    constructor() {
        this.schedules = new Map<string, Schedule>();
        this.logger = log4js.getLogger('ScheduleManager');
        this.scheduledJobs = new Map<string, node_schedule.Job>();
        this.irrigationController = IrrigationController.getInstance();
    }


    /**
     * Get an instance of the ScheduleManager
     *
     * @static
     * @returns {ScheduleManager}
     * @memberof ScheduleManager
     */
    public static getInstance(): ScheduleManager {
        if (ScheduleManager.instance) {
            return ScheduleManager.instance
        } else {
            ScheduleManager.instance = new ScheduleManager();
            return ScheduleManager.instance;
        }
    }


    /**
     * Executes a scheduled action
     *
     * @private
     * @param {Schedule} schedule
     * @memberof ScheduleManager
     */
    private execScheduledAction(schedule: Schedule) {
        this.logger.debug(`Executing scheduled action "${schedule.action}" for schedule = "${schedule.name}"`);
        switch (schedule.action) {
            case "on": {
                this.irrigationController.switchOnOff(schedule.deviceId, true, schedule.duration);
                break;
            }
            case "off": {
                this.irrigationController.switchOnOff(schedule.deviceId, false);
                break;
            }
            default: {
                this.logger.warn(`Invalid scheduled action "${schedule.action}", ignored"`);
            }
        }
    }


    /**
     * Schedule jobs for all the schedules
     *
     * @private
     * @memberof ScheduleManager
     */
    private scheduleJobs(): void {
        this.logger.debug('scheduleJobs()');
        this.schedules.forEach( (schedule) => {
            if (schedule.rule && schedule.active) {
                this.scheduleJob(schedule);
            }
        });
        
    }

    /**
     * Schedule a single job and add it to the list of jobs
     *
     * @private
     * @param {Schedule} schedule
     * @memberof ScheduleManager
     */
    private scheduleJob(schedule: Schedule) {
        this.logger.debug(`Scheduling job "${schedule.name}"`);
        let scheduledJob = node_schedule.scheduleJob(schedule.rule, this.execScheduledAction.bind(this, schedule));
        this.scheduledJobs.set(schedule.name, scheduledJob);        
    }


    /**
     * Reschedule an existing job using updated recurrence rules
     *
     * @private
     * @param {Schedule} schedule
     * @memberof ScheduleManager
     */
    private rescheduleJob(schedule: Schedule): void {
        this.logger.debug(`rescheduleJob("${schedule.name}")`);
        let scheduledJob = this.scheduledJobs.get(schedule.name);
        if (scheduledJob) {
            scheduledJob.reschedule(schedule.rule);
        }
    }


    /**
     * Cancel job for a deactivated schedule
     *
     * @private
     * @param {Schedule} schedule
     * @memberof ScheduleManager
     */
    private cancelJob(schedule: Schedule): void {
        this.logger.debug(`cancelJob("${schedule.name}")`);
        let scheduledJob = this.scheduledJobs.get(schedule.name);
        if (scheduledJob) {
            scheduledJob.cancel(false);
        }
    }

    private deleteJob(schedule: Schedule): void {
        this.logger.debug(`deleteJob("${schedule.name}")`);
        let scheduledJob = this.scheduledJobs.get(schedule.name);
        if (scheduledJob) {
            scheduledJob.cancel(false);
            this.scheduledJobs.delete(schedule.name);

        }
    }

    /**
     * Load schedules from schedules.json
     *
     * @returns 
     * @memberof ScheduleManager
     */
    async loadSchedules() {
        this.logger.debug('loadSchedules()');
        try {
            let data = await promisifiedReadFile(Constants.schedulesFileName);
            let schedArray:Array<Schedule> = JSON.parse(data.toString());
            this.schedules = new Map(schedArray.map( (e):[string, Schedule] => [e.name, e]));
            this.scheduleJobs();
            return this.schedules;
        } catch (err) {
            this.logger.error(err);
            throw err;
        }

    }


    /**
     * Return list of schedules
     *
     * @returns {Array<Schedule>}
     * @memberof ScheduleManager
     */
    getSchedules(): Array<Schedule> {
        return Array.from(this.schedules.values());
    }



    /**
     * Get count of schedules for device
     *
     * @param {string}  deviceId
     * @returns {number}
     * @memberof ScheduleManager
     */
    getScheduleCount(deviceId: string): number {
        let count = 0;
        this.schedules.forEach(schedule => {
            if (schedule.deviceId === deviceId) {
                count++;
            }
        });
        return count;
    }

    /**
     * Return a schedule
     *
     * @param {string} name
     * @returns {(Schedule | undefined)}
     * @memberof ScheduleManager
     */
    getSchedule(name: string): Schedule | undefined {
        return this.schedules.get(name);
    }


    /**
     * Update and existing schedule with new rules
     *
     * @param {Schedule} newSchedule
     * @memberof ScheduleManager
     */
    async updateSchedule(newSchedule: Schedule) {
        this.logger.debug('updateSchedule()');
        let schedule = this.getSchedule(newSchedule.name);
        if (schedule) {
            Object.assign(schedule, newSchedule);

            if (newSchedule.active) {
                // Reschedule to effect any rules that may have changed
                this.rescheduleJob(newSchedule);
            } else {
                // Cancel schedule if deactivated
                this.cancelJob(newSchedule);
            }

        } else {
            this.schedules.set(newSchedule.name, newSchedule);
            this.scheduleJob(newSchedule);
        }
        await this.saveSchedules();

    }

    async deleteSchedule(name: string) {
        this.logger.debug('deleteSchedule()');
        let schedule = this.schedules.get(name);
        if (schedule) {
            this.schedules.delete(name);
        }
        await this.saveSchedules();
    }

    /**
     * Persist the schedules to schedules.json
     *
     * @returns 
     * @throws Error
     * @memberof ScheduleManager
     */
    async saveSchedules() {
        this.logger.debug('saveSchedules()');
        try {
            let schedArray = Array.from(this.schedules.values());
            await promisifiedWriteFile(Constants.schedulesFileName, JSON.stringify(schedArray, null, 4));
        } catch (err) {
            this.logger.error(err);
            let e = new Error();
            e.name = 'Schedules save failed';
            e.message = err.message;
            return e;
        }

    }


    /**
     * Create a new, empty schedule
     *
     * @param {string} name
     * @param {string} deviceId
     * @returns {Schedule}
     * @throws {Error}  
     * @memberof ScheduleManager
     */
    newSchedule(name: string, deviceId: string): Schedule {
        let schedule: Schedule
        if (this.getSchedule(name)) {
            let e = new Error();
            e.name = 'Schedule exists';
            e.message = `Schedule with name ${name} already exists`;
            throw e;
        } else {
            schedule = {
                name: name,
                description: "",
                deviceId: deviceId,
                action: "off",
                duration: 0,
                active: false,
                rule: new node_schedule.RecurrenceRule()
            }
        }
        return schedule;
    }

}




