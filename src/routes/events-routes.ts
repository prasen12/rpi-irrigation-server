import { EventLogger } from '../events/event-logger';
/*
 * MIT License
 * 
 * Copyright (c) 2018 Prasen Palvankar1
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
 * Created Date: Sunday, July 22nd 2018, 11:23:23 am
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sun Jul 22 2018
 * Modified By: Prasen Palvankar
 * -----
 */

import * as express from 'express';
import { RouteHandler, Operations } from '../app-server/route-handler';
import * as log4js from 'log4js';


/**
 * Handles schedule management requests
 *
 * @export
 * @class Events
 * @extends {RouteHandler}
 */
export class EventsRoutes extends RouteHandler {
    private logger: log4js.Logger;
    private eventLogger: EventLogger;

    constructor() {
        super('/api/events');
        this.logger = log4js.getLogger('EventsRoutes');
        this.eventLogger = EventLogger.getInstance();
        this.setHandler(Operations.GET, '/', this.handleGetEvents.bind(this));
      
    }

    private async handleGetEvents(req: express.Request, res: express.Response) {
        console.log(req.query);
        try {
            let events = await this.eventLogger.getEvents( {
                limit: req.query.limit ? req.query.limit : 20,
                offset: req.query.offset,
                eventType: req.query.eventType,
                eventSource: req.query.eventSource,
                deviceId: req.query.deviceId,
                dateRange: {                    
                    from: 1532300801177,
                    to: new Date().getTime()
                }
            });
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({status: 'ERROR', error: error});
        }
    }
    

}

