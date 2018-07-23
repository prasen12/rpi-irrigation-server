
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
 * Created Date: Tuesday, July 10th 2018, 6:14:13 pm
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sun Jul 15 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import { readFile, writeFile } from "fs"
import { Constants, DEVICE_TYPES, promisifiedReadFile, promisifiedWriteFile } from '../common/common';
import * as log4js from 'log4js';
import * as util from 'util'


/**
 * Device
 *
 * @export
 * @interface Device
 */
export interface Device {
    id: string;
    name: string;
    type: DEVICE_TYPES;
    enabled: boolean;
    maxTime: number;
    gpioPin: number;
}


/**
 * Manages device definitions
 *
 * @export
 * @class DeviceDataManager
 */
export class DeviceDataManager {
    private logger = log4js.getLogger('DeviceDataManager');
    private static deviceDataManager: DeviceDataManager;
    private deviceData: Array<Device>;

    constructor() {
        this.deviceData = new Array<Device>();
    }


    /**
     * Get all registered devices
     *
     * @readonly
     * @type {Array<Device>}
     * @memberof DeviceDataManager
     */
    get devices(): Array<Device> {
        return this.deviceData;
    }


    /**
     * Get devices of a specified type
     *
     * @param {DEVICE_TYPES} type
     * @returns {Array<Device>}
     * @memberof DeviceDataManager
     */
    getDevices(type: DEVICE_TYPES): Array<Device> {
        return this.deviceData.filter(e => e.type === type);
    }


    /**
     * Get a specific device
     *
     * @param {string} deviceId
     * @returns {(Device | undefined)}
     * @memberof DeviceDataManager
     */
    getDevice(deviceId: string): Device | undefined {
        return this.deviceData.find(e => e.id === deviceId);
    }



    /**
     * Update device information
     *
     * @param {Device} device
     * @throws Error
     * @memberof DeviceDataManager
     */
    async putDevice(device: Device) {
        let d = this.getDevice(device.id);
        if (d) {
            Object.assign(d, device);
        } else {
            this.deviceData.push(device);
        }
        try {
            await promisifiedWriteFile(Constants.deviceDataFileName, JSON.stringify(this.deviceData, null, 4));
        } catch (err) {
            this.logger.error(`Failed to write device data ${err}`);
            throw err;
        }
    }





    /**
     * Get an instance of the data manager
     *
     * @static
     * @returns {DeviceDataManager}
     * @memberof DeviceDataManager
     */
    static  getInstance(): DeviceDataManager {
        if (!DeviceDataManager.deviceDataManager) {        
            DeviceDataManager.deviceDataManager = new DeviceDataManager();
        }

        return DeviceDataManager.deviceDataManager;
    }


    /**
     * Load the device data from file
     *
     * @memberof DeviceDataManager
     */
    public async loadDeviceData() {
        this.logger.debug('loadDeviceData()');
        try {
            let data = await promisifiedReadFile(Constants.deviceDataFileName);     
            this.deviceData = JSON.parse(data.toString());
        } catch (error) {
            this.logger.error('Failed to read device list', error);
            throw error;
        }
    }

}