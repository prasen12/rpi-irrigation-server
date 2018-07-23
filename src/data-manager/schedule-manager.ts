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
 * Last Modified: Sun Jul 22 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import * as node_schedule from "node-schedule";
import { readFile, writeFile } from 'fs';
import * as util from 'util';
import { Constants, promisifiedReadFile, promisifiedWriteFile } from "../common/common";
import * as log4js from "log4js";
import { IrrigationController } from './../controllers/irrigation-controller';

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
    action: string
};


/**
 * Scheduled Job
 *
 * @interface ScheduledJob
 */
interface ScheduledJob {
    name: string,
    job: node_schedule.Job
};


/**
 * Singleton, Schedule manager 
 * 
 * @export
 * @class ScheduleManager
 */
export class ScheduleManager {
    private schedules: Array<Schedule>;
    private logger: log4js.Logger;
    private scheduledJobs: Array<ScheduledJob>;
    static instance: ScheduleManager;
    private  irrigationController: IrrigationController;

    constructor() {
        this.schedules = new Array<Schedule>();
        this.logger = log4js.getLogger('ScheduleManager');
        this.scheduledJobs = new Array<ScheduledJob>();
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
                this.irrigationController.switchOnOff(schedule.deviceId, true);                
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
        for (let schedule of this.schedules) {
            if (schedule.rule) {
                this.scheduleJob(schedule);
            }
        }
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
        this.scheduledJobs.push({ name: schedule.name, job: scheduledJob });
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
        let scheduledJob = this.scheduledJobs.find(e => e.name === schedule.name);
        if (scheduledJob) {
            scheduledJob.job.reschedule(schedule.rule);
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
            this.schedules = JSON.parse(data.toString());
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
        return this.schedules;
    }


    /**
     * Return a schedule
     *
     * @param {string} name
     * @returns {(Schedule | undefined)}
     * @memberof ScheduleManager
     */
    getSchedule(name: string): Schedule | undefined {
        return this.schedules.find(e => e.name === name);
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
            // Reschedule to effect any rules that may have changed
            this.rescheduleJob(newSchedule);
        } else {
            this.schedules.push(newSchedule);         
            this.scheduleJob(newSchedule);   
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
            await promisifiedWriteFile(Constants.schedulesFileName, JSON.stringify(this.schedules, null, 4));
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
                action: "",
                rule: new node_schedule.RecurrenceRule()
            }
        }
        return schedule;
    }

}




