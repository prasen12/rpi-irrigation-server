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
 * Last Modified: Sun Jul 15 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import {Router, RequestHandler} from 'express';

export const enum Operations {
    GET = "get",
    PUT = "put",
    POST = "post",
    DELETE = "delete"
};

/**
 * Route handler
 *
 * @export
 * @abstract
 * @class RouteHandler
 */
export abstract class RouteHandler {
    private _router: Router;
    private _path: string;
    //public operations: Operations;

	constructor(path: string) {
        this._path = path;
        this._router =  Router();
    }

    setHandler(operation: Operations, resourcePath: string, handler:RequestHandler): void {
        this._router[operation](resourcePath, handler);
    }
    
   
    get resourcePath():string {
        return this._path;
    }

    get router(): Router {
        return this._router;
    }

}