/*
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
 * Created Date: Tuesday, July 24th 2018, 7:38:21 pm
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Tue Jul 24 2018
 * Modified By: Prasen Palvankar
 * -----
 */


import * as events from "events";

export enum SystemEventTypes {
    REBOOT = 'reboot',
    RESTART = 'restart',
    CLEANUP = 'cleanup' 
};

export class SystemEventEmitter extends events.EventEmitter {
    private static instance: SystemEventEmitter;

    constructor() {
        super();
    }

    public static getInstance(): SystemEventEmitter {
        if (!SystemEventEmitter.instance) {
            SystemEventEmitter.instance = new SystemEventEmitter();
        }
        return SystemEventEmitter.instance;
    }

    public emit(event: SystemEventTypes): boolean {
        return super.emit(event);
    }

}