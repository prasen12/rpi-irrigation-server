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
 * Created Date: Tuesday, July 10th 2018, 8:07:57 am
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Thu Jul 12 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import * as util from 'util'
import {readFile, writeFile} from 'fs';
import * as process from 'process';


export class Constants {
    public static appRoot = `${__dirname}/..`;
    public static webAppRoot = `${process.env['HOME']}/Projects/rpi-irrigation/webapp/www`
    public static deviceDataFileName = `${Constants.appRoot}/../data/devices.json`;
    public static schedulesFileName = `${Constants.appRoot}/../data/schedules.json`;
    public static eventLogDBName = `${Constants.appRoot}/../data/eventlog.sqlite`;

    p() {
        process
    }

};

export const Settings = require(`${Constants.appRoot}/../config/settings.json`);

export enum DEVICE_TYPES {
    IRRIGATION = "irrigation"
};

export const promisifiedReadFile = util.promisify(readFile);
export const promisifiedWriteFile = util.promisify(writeFile);