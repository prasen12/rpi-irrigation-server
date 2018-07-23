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
 * Created Date: Sunday, July 15th 2018, 11:20:03 pm
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sun Jul 22 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import * as express from 'express';
import { RouteHandler, Operations } from '../app-server/route-handler';
import * as log4js from 'log4js';
import { ScheduleManager } from '../data-manager/schedule-manager';


/**
 * Handles schedule management requests
 *
 * @export
 * @class ScheduleRoutes
 * @extends {RouteHandler}
 */
export class ScheduleRoutes extends RouteHandler {
    private logger: log4js.Logger;
    private scheduleManager: ScheduleManager;

    constructor() {
        super('/schedules');
        this.logger = log4js.getLogger('SchedulesRoute');
        this.scheduleManager = ScheduleManager.getInstance();
        this.setHandler(Operations.PUT, '/:name', this.handleUpdateSchedule.bind(this));
        this.setHandler(Operations.GET, '/', this.handleGetSchedules.bind(this));
        this.setHandler(Operations.GET, '/:name', this.handleGetSchedule.bind(this));
        this.setHandler(Operations.GET, '/:deviceId/:name/new', this.handleCreateNewSchedule.bind(this));
    }

    private handleUpdateSchedule(req: express.Request, res: express.Response) {
        this.logger.debug(`handleUpdateSchedule("${req.params.name}")`);
        if (req.params.name !== req.body.name) {
            res.status(403).json({status: 'ERROR', error: `Name in request body (${req.body.name}) doesnot match name in paramter (${req.params.name})`});
            return;
        }

        try {
            this.scheduleManager.updateSchedule(req.body);
            res.status(201).json({status:"OK"});
        } catch (error) {
            res.status(500).json( {
                status: "ERROR",
                error: error
            });
        }
       

    }

    private handleGetSchedules(req: express.Request, res: express.Response) {
        this.logger.debug(`handleGetSchedules()`);
        res.status(200).json({
            status: "OK",
            data: this.scheduleManager.getSchedules()
        });
    }

    private handleGetSchedule(req: express.Request, res: express.Response) {
        this.logger.debug(`handleGetSchedule("${req.params.name}")`);
        let schedule = this.scheduleManager.getSchedule(req.params.name);
        if (schedule){
            res.status(200).json({status: "OK", data: schedule});
        } else {
            res.status(404).json({status: "ERROR", error: `Schedule "${req.params.name}" not found.`});
        }

    }

    private handleCreateNewSchedule(req: express.Request, res: express.Response) {
        this.logger.debug(`handleCreateNewSchedule("${req.params.name}", "${req.params.deviceId}")`);
        try {
            res.status(200).json( {
                status: "OK",
                data: this.scheduleManager.newSchedule(req.params.name, req.params.deviceId)
            });
        } catch (error) {
            res.status(500).json( {
                status: "ERROR",
                error: error
            });
        }
       
    }

}