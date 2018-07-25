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
 * Created Date: Tuesday, July 10th 2018, 8:07:05 am
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Tue Jul 24 2018
 * Modified By: Prasen Palvankar
 * -----
 */



import * as express from 'express';
import { RouteHandler, Operations } from '../app-server/route-handler';
import * as log4js from 'log4js';
import { DeviceDataManager, Device } from '../data-manager/device-data-manager';


/**
 * Handles device management requests
 *
 * @export
 * @class DevicesRoutes
 * @extends {RouteHandler}
 */
export class DevicesRoutes extends RouteHandler {
    private logger: log4js.Logger;
    private deviceDataManager: DeviceDataManager;

    constructor() {
        super('/api/devices');
        this.logger = log4js.getLogger('DevicesRoute');
        this.setHandler(Operations.POST, '/', this.handlePostDevice.bind(this));
        this.setHandler(Operations.GET, '/', this.handleGetDevices.bind(this));
        this.setHandler(Operations.GET, '/:deviceId', this.handleGetDevice.bind(this));
       
        this.deviceDataManager = DeviceDataManager.getInstance();
    }


    /**
     * Add or update a device.
     *
     * @private
     * @param {express.Request} req
     * @param {express.Response} res
     * @memberof DevicesRoutes
     */
    private async handlePostDevice(req: express.Request, res: express.Response) {
        this.logger.debug(`handlePostDevices`);
        this.logger.debug(req.body);
        try {
            let device = req.body;
            await this.deviceDataManager.putDevice(device);      
            res.status(200).json({status: "OK"}); 
        } catch (err) {
            console.log(err)
            res.status(500).json({status:"ERROR", error: err});
        }    
    }


    /**
     * Get devices
     *
     * @private
     * @param {express.Request} req
     * @param {express.Response} res
     * @memberof DevicesRoutes
     */
    private handleGetDevices(req: express.Request, res: express.Response) {
        this.logger.debug(`handleGetDevices()`);        
        res.status(200).json({status: "OK", devices: this.deviceDataManager.devices});    
    }

    /**
     * Get a specified device
     *
     * @private
     * @param {express.Request} req
     * @param {express.Response} res
     * @memberof DevicesRoutes
     */
    private handleGetDevice(req: express.Request, res: express.Response) {
        let device = this.deviceDataManager.getDevice(req.params.deviceId);
        if (device) {
            res.status(200).json({status: "OK", device});
        } else {
            res.status(404).json({status:"NOT_FOUND", error: `Device with ID ${req.params.deviceId} not found.`});
        }
    }
}