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
 * Created Date: Saturday, July 14th 2018, 10:02:50 am
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sat Jul 14 2018
 * Modified By: Prasen Palvankar
 * -----
 */


import * as express from 'express';
import { RouteHandler, Operations } from '../route-handler';
import * as log4js from 'log4js';
import { IrrigationController } from '../controllers/irrigation-controller';


/**
 * Handle controller requests
 *
 * @export
 * @class ControllerRoutes
 * @extends {RouteHandler}
 */
export class ControllerRoutes extends RouteHandler {
    private logger: log4js.Logger;
    private irrigationController: IrrigationController;
    constructor() {
        super('/controller');
        this.logger = log4js.getLogger('ControllerRoutes');
        this.setHandler(Operations.GET, '/stations', this.handleGetStations.bind(this));
        this.setHandler(Operations.GET, '/stations/:id/status', this.handleGetStationStatus.bind(this));
        this.setHandler(Operations.PUT, '/stations/:id/operation', this.handleStationOperation.bind(this));
        this.irrigationController = new IrrigationController();
        try {
            this.irrigationController.init();
        } catch {
        }

    }

    
    /**
     * Get all stations
     *
     * @private
     * @param {express.Request} req
     * @param {express.Response} res
     * @memberof ControllerRoutes
     */
    private handleGetStations(req: express.Request, res: express.Response) {
        this.logger.debug(`handleGetStattions`);
        res.status(200).json({
            status: "OK",
            data: this.irrigationController.getStations()
        })
     
    }


    /**
     *  Get a station's status
     *
     * @private
     * @param {express.Request} req
     * @param {express.Response} res
     * @memberof ControllerRoutes
     */
    private handleGetStationStatus(req: express.Request, res: express.Response) {
        this.logger.debug(`handleGetStationStatus(${req.params.id})`);
        let stationStatus = this.irrigationController.getStatus(req.params.id);
        if (stationStatus) {
            res.status(200).json({
                status: "OK",
                data: stationStatus
            });
        } else {
            res.status(404).json({
                status: 'ERROR',
                error: `Station with id ${req.params.id} not found`
            });
        }
    }
    

    /**
     * Turn a station on or off
     * Expects a JSON object {action: "on | off"} as the body 
     * @private
     * @param {express.Request} req
     * @param {express.Response} res
     * @returns
     * @memberof ControllerRoutes
     */
    private handleStationOperation(req: express.Request, res: express.Response) {
        this.logger.debug(`handleStationOperation(${req.params.id})`);
        if ((!req.body.action) || ((req.body.action.toLowerCase() !== 'on') && (req.body.action.toLowerCase() !== 'off'))) {
            res.status(403).json({
                status: "ERROR",
                error: "Invalid request"
            });
            return;
        }
        try {
            this.irrigationController.switchOnOff(req.params.id, req.body.action.toLoweCase() === 'on');
            res.status(201).json({
                status: "OK",
                data: {stationId: req.params.id, status: req.body.action}
            });
        } catch (error) {
            res.status(500).json({
                status: "ERROR",
                error: error
            });
        }
    }   
    
}