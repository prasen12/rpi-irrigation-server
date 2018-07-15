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
import { DeviceDataManager, Device } from '../data-manager/devce-data-manager';
import { DEVICE_TYPES } from '../common';
import { GPIO_MODES, Gpio } from './gpio';


export interface Station {
    device: Device,
    gpio: Gpio;
    timer?: NodeJS.Timer;
}

export interface StationStatus {
    id: string;
    status: string;
}

export class IrrigationController {
    private logger: log4js.Logger;
    private stations: Array<Station>;

    constructor() {
        this.logger = log4js.getLogger('IrrigationController');
        this.stations = new Array<Station>();
    }

    async init() {
        try {
            let dm = await DeviceDataManager.getInstance();
            let devices = dm.getDevices(DEVICE_TYPES.IRRIGATION);
            devices.forEach(device => {
                this.logger.debug(`Initializing GPIO pin ${device.gpioPin} for ${device.name}`);
                this.stations.push({
                    device: device,
                    gpio: new Gpio(device.gpioPin, GPIO_MODES.OUTPUT)
                });
                this.switchOnOff(device.id, false);
            });
        } catch (error) {
            this.logger.error('IrrigationController: init() failed');
            throw (error);
        }
        
    }

    switchOnOff(stationId: string, on: boolean) {
        this.logger.info(`Turning station ${stationId} ${on ? "ON" : "OFF"}`);

        let station = this.stations.find(s => s.device.id === stationId);
        if (station === undefined) {
            throw `Invalid station  - ${stationId}`;
        }

        // Cancel timer if set
        if (station.timer) {
            clearTimeout(station.timer);
            delete station.timer;
        }

        station.gpio.digitalWrite((on === true ? 0 : 1));

        // Start timer to force a shut off after maxTime
        if (on && station.device.maxTime) {
            this.logger.info(`Setting timeout for ${stationId} to ${station.device.maxTime} minutes`);
            station.timer = setTimeout(args => {
                this.logger.info(`Station on for more than maxTime of ${args.maxTime} minutes, turning it off.`);
                args.gpio.digitalWrite(1);
            }, (station.device.maxTime * (1000 * 60)), station);
        }        
    }

    getStatus(stationId: string):StationStatus|undefined {
        let status:StationStatus|undefined = undefined;

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

    getStations():Array<Station> {
        return this.stations;
    }

    

    getAllStatus():Array<StationStatus> {
        let status = new Array<StationStatus>();

        this.stations.forEach(station => {
            status.push({
                id:  station.device.id,
                status: station.gpio.digitalRead()
            });
        });
        this.logger.debug(`getAllStatus: returning ${JSON.stringify(status)}`);
        return status;
    }

}
