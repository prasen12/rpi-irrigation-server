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
 * Created Date: Friday, July 13th 2018, 7:08:21 pm
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sat Jul 14 2018
 * Modified By: Prasen Palvankar
 * -----
 */

export enum GPIO_MODES {
    INPUT = 0,
    OUTPUT = 1,
    INPUT_OUTPUT = 2
};

export class Gpio {
    private pin: number;
    private mode: GPIO_MODES;

    constructor(pin: number, mode: GPIO_MODES) {
        this.pin = pin;
        this.mode = mode;
    }

    digitalWrite(state: number): void {
        // call gpio lib
    }

    digitalRead():string {
        // call gpio lib
        return "off";
    }
}