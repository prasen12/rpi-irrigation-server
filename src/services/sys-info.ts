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
 * Created Date: Saturday, July 14th 2018, 6:50:38 pm
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sat Jul 14 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import * as os from 'os';
import * as fs from 'fs';
import * as util from 'util';
import * as child_process from 'child_process';

/**
 * System load info
 *
 * @export
 * @interface SysLoadInfo
 */
export interface SysLoadInfo {
    last1: number;
    last5: number
    last15: number;
};


export class SystemInfo {
    constructor() {

    }

    /**
     *  CPU Temperature in F
     *
     * @readonly
     * @type {string}
     * @memberof SystemInfo
     */
    get cpuTemp():string {
        let cpuTempStr = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
        let cpuTemp =  Number.parseFloat(cpuTempStr);
        cpuTempStr = (cpuTemp / 1000).toPrecision(3);
        return cpuTempStr;
    }

    /**
     * Get free memory in bytes
     *
     * @readonly
     * @type {number}
     * @memberof SystemInfo
     */
    get freeMem():number {
        return (os.freemem());
    }

    
    /**
     * Total memory (bytes)
     *
     * @readonly
     * @type {number}
     * @memberof SystemInfo
     */
    get totalMem():number {
        return (os.totalmem());
    }

    
    /**
     * Get memory in use (bytes)
     *
     * @readonly
     * @type {number}
     * @memberof SystemInfo
     */
    get usedMem():number {
        return ((os.totalmem() - os.freemem()));
    }

    /**
     * Get current system load info
     *
     * @readonly
     * @type {SysLoadInfo}
     * @memberof SystemInfo
     */
    get loadAverage():SysLoadInfo {
        let load = os.loadavg();
        return {
            last1: load[0],
            last5: load[1],
            last15: load[2]
        };
    }


    /**
     * Get system uptime 
     *
     * @readonly
     * @type {number}
     * @memberof SystemInfo
     */
    get upTime():number {
        return os.uptime();
    }
    

}