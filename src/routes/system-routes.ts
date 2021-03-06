/**
 * MIT License
 * 
 * Copyright (c) 2018 Prasen Palvankar
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
 * Created Date: Saturday, July 14th 2018, 11:21:52 am
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Tue Jul 24 2018
 * Modified By: Prasen Palvankar
 * -----
 */




import { RouteHandler, Operations } from '../app-server/route-handler';
import * as log4js from 'log4js';
import { SystemInfo } from '../services/sys-info';
import * as express from 'express';
import { SystemEventEmitter, SystemEventTypes } from '../services/sys-events';

/**
 * Handle requests for /system
 *
 * @export
 * @class SystemRoutes
 * @extends {RouteHandler}
 */
export class SystemRoutes extends RouteHandler {
    private logger: log4js.Logger;
    private sysInfo: SystemInfo;
    private eventEmitter: SystemEventEmitter;

    constructor() {
        super('/api/system');
        this.logger = log4js.getLogger('SystemRoutes');
        this.sysInfo = new SystemInfo();
        this.eventEmitter = SystemEventEmitter.getInstance();
        this.setHandler(Operations.GET, '/info', this.handleGetSysInfo.bind(this));
        this.setHandler(Operations.POST, '/control', this.handlePostControl.bind(this));
    }


    /**
     * Get current system information
     *
     * @param {express.Request} req
     * @param {express.Response} res
     * @memberof SystemRoutes
     */
    handleGetSysInfo(req: express.Request, res: express.Response) {
        this.logger.debug('handleGetSysInfo()');
        res.status(200).json({
            status: "OK",
            data: {
                cpuTemp: this.sysInfo.cpuTemp,
                totalMem: this.sysInfo.totalMem,
                freeMem: this.sysInfo.freeMem,
                usedMem: this.sysInfo.usedMem,
                load: this.sysInfo.loadAverage,
                uptime: this.sysInfo.upTime
            }
        });
    }

    handlePostControl(req: express.Request, res: express.Response) {
        this.logger.debug('handlePostOperation()');
        switch (req.body.action) {
            case 'reboot': {
                this.eventEmitter.emit(SystemEventTypes.REBOOT);
                res.status(201).json({ status: "OK" });
                break;
            }
            case 'restart': {
                this.eventEmitter.emit(SystemEventTypes.RESTART);
                res.status(201).json({ status: 'OK' });
                break;
            }
            default:
                res.status(400).json({ status: 'ERROR', error: `Invalid action ${req.params.action}` });
        }

    }
}