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
 * Created Date: Thursday, July 12th 2018, 5:25:13 pm
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sun Jul 15 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import * as log4js from 'log4js';
import { DeviceDataManager, Device } from '../data-manager/device-data-manager';
import { DEVICE_TYPES } from '../common/common';
import { GPIO_MODES, GpioHandler } from './gpio-handler';
import { EventLogger, EventTypes } from '../events/event-logger';


/**
 * Irrigation station
 *
 * @export
 * @interface Station
 */
export interface Station {
    device: Device,
    gpio: GpioHandler;
    timer?: NodeJS.Timer;
    lastEvent: {
        eventTime: number;
        action: string;
    }
}

/**
 * Status response 
 *
 * @export
 * @interface StationStatus
 */
export interface StationStatus {
    id: string;
    status: string;
}

/**
 * Controller for managing irrigation stations
 * 
 * Used as a singleton
 *
 * @export
 * @class IrrigationController
 */
export class IrrigationController {
    private logger: log4js.Logger;
    private stations: Array<Station>;
    private static instance: IrrigationController;
    private eventLogger: EventLogger;

    constructor() {
        this.logger = log4js.getLogger('IrrigationController');
        this.stations = new Array<Station>();
        this.eventLogger = EventLogger.getInstance();
    }


    /**
     * Get an instance of IrrigationController
     *
     * @static
     * @returns {IrrigationController}
     * @memberof IrrigationController
     */
    public static getInstance(): IrrigationController {
        if (!IrrigationController.instance) {
            IrrigationController.instance = new IrrigationController();
        }
        return IrrigationController.instance;
    }


    /**
     * Initializes the controller and and the GPIO pins
     * using the devices data
     *
     * @memberof IrrigationController
     * 
     */
    async init() {
        this.logger.debug('init()');
        try {
            let dm = DeviceDataManager.getInstance();
            let devices = dm.getDevices(DEVICE_TYPES.IRRIGATION);
            devices.forEach(device => {
                this.logger.debug(`Initializing GPIO pin ${device.gpioPin} for ${device.name}`);
                this.stations.push({
                    device: device,
                    lastEvent: {
                        eventTime: new Date().getTime(),
                        action: "Initialized"
                    },
                    gpio: new GpioHandler(device.gpioPin, GPIO_MODES.OUTPUT)
                });
                this.switchOnOff(device.id, false);
            });
        } catch (error) {
            this.logger.error('IrrigationController: init() failed');
            throw (error);
        }

    }


    /**
     * Turn off/on an irrigation station
     *
     * @param {string} stationId
     * @param {boolean} on
     * @memberof IrrigationController
     */
    async switchOnOff(stationId: string, on: boolean) {
        let action = on ? "ON" : "OFF";
        this.logger.info(`Turning station ${stationId} ${action}`);

        let station = this.stations.find(s => s.device.id === stationId);
        if (station === undefined) {
            throw `Invalid station  - ${stationId}`;
        }

        // Cancel timer if set
        if (station.timer) {
            this.logger.debug('Cancelling active timer');
            clearTimeout(station.timer);
            delete station.timer;
        }

        station.gpio.digitalWrite((on === true ? 0 : 1));

        try {
            station.lastEvent.eventTime = new Date().getTime();
            station.lastEvent.action = `Turned ${action}`;
            await this.eventLogger.addEvent({
                eventTime: station.lastEvent.eventTime,
                eventSource: this.constructor.name,
                text: `Irrigation station ${stationId} turned ${action}`,
                type: EventTypes.INFO,
                deviceId: stationId
            });
        } catch (error) {
            this.logger.debug('Failed to write event');
        }


        // Start timer to force a shut off after maxTime
        if (on && station.device.maxTime) {
            this.logger.info(`Setting timeout for ${stationId} to ${station.device.maxTime} minutes`);
            station.timer = setTimeout(args => {
                this.logger.info(`Station on for more than maxTime of ${args.device.maxTime} minutes, turning it off.`);
                args.gpio.digitalWrite(1);
                this.eventLogger.addEvent({
                    eventTime: new Date().getTime(),
                    eventSource: this.constructor.name,
                    text: `${stationId} on for more than maxTime of ${args.device.maxTime} minutes, turning it off.`,
                    type: EventTypes.WARNING,
                    deviceId: stationId
                }).catch(err => this.logger.debug('Failed to write event'))

            }, (station.device.maxTime * (1000 * 60)), station);
        }
    }


    /**
     * Return the current status of a station
     *
     * @param {string} stationId
     * @returns {(StationStatus|undefined)}
     * @memberof IrrigationController
     */
    getStatus(stationId: string): StationStatus | undefined {
        let status: StationStatus | undefined = undefined;

        this.logger.debug(`Getting status for station ${stationId}`);

        let station = this.stations.find(e => e.device.id === stationId);
        if (station) {
            status = {
                status: station.gpio.digitalRead(),
                id: stationId
            };
            this.logger.debug(`Returning ${JSON.stringify(status)}`);
        } else {
            this.logger.debug(`Unable to find station with id ${stationId}`);
        }

        return status;

    }

    /**
     * Return a list of registered irrigation stations
     *
     * @returns {Array<Station>}
     * @memberof IrrigationController
     */
    getStations(): Array<Station> {
        return this.stations;
    }



    /**
     * Get status of all the stations
     *
     * @returns {Array<StationStatus>}
     * @memberof IrrigationController
     */
    getAllStatus(): Array<StationStatus> {
        let status = new Array<StationStatus>();

        this.stations.forEach(station => {
            status.push({
                id: station.device.id,
                status: station.gpio.digitalRead()
            });
        });
        this.logger.debug(`getAllStatus: returning ${JSON.stringify(status)}`);
        return status;
    }

}
