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
 * Created Date: Tuesday, July 24th 2018, 8:20:19 am
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Tue Jul 24 2018
 * Modified By: Prasen Palvankar
 * -----
 */


import * as process from 'process';
import * as log4js from 'log4js';

import {SystemEventEmitter, SystemEventTypes} from './services/sys-events';
import { Server } from './server';


let exit = function(exitCode: number) {
    systemEventEmitter.emit(SystemEventTypes.CLEANUP);
    //Give some time for cleanups to complete
    console.info('Waiting for cleanup to complete.');
    setTimeout(() => {
        console.info("Done.");
        process.exit(exitCode);
    }, 10000);
};

let server = new Server();
let systemEventEmitter = SystemEventEmitter.getInstance();

// Exit with appropriate status code  to let the shell script take OS level actions
systemEventEmitter.on(SystemEventTypes.RESTART, () => exit(0));
systemEventEmitter.on(SystemEventTypes.REBOOT, () => exit(20));

// Exit handlers for clean shutdown
process.on('SIGINT', () => exit(0));
process.on('SIGTERM', () => exit(0));

// Run!
server.run();

