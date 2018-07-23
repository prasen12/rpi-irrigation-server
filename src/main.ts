import { EventLogger, EventTypes } from './events/event-logger';
import { IrrigationController } from './controllers/irrigation-controller';
import { ScheduleRoutes } from './routes/schedule-routes';
import { DeviceDataManager } from './data-manager/device-data-manager';
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
 * Created Date: Thursday, July 12th 2018, 9:46:47 am
 * 
 * Author: Prasen Palvankar
 * 
 * -----
 * Last Modified: Sun Jul 15 2018
 * Modified By: Prasen Palvankar
 * -----
 */


import { Server } from './app-server/server';
import * as log4js from 'log4js'
import { DevicesRoutes } from './routes/devices-routes';
import { ControllerRoutes } from './routes/controller-routes';
import { SystemRoutes } from './routes/system-routes';
import { ScheduleManager } from './data-manager/schedule-manager';

import { Settings } from './common/common';
import { EventsRoutes } from './routes/events-routes';


log4js.configure(Settings.logger);

const logger = log4js.getLogger('main');

// Initialize app server
logger.info('Initializing application server');
let server = new Server()


// Initialize data managers and controllers
logger.info('Initializing data managers and controllers');
let scheduleManager = ScheduleManager.getInstance();
let deviceDataManger = DeviceDataManager.getInstance();
let irrigationController = IrrigationController.getInstance();
let eventLogger = EventLogger.getInstance();

deviceDataManger.loadDeviceData()
    .then(() => {
        logger.info('Device data manager initialized');
        return eventLogger.init();
    })
    .then(() => {
        logger.info('Event Logger initialized');
        return irrigationController.init()
    })
    .then(() => {
        logger.debug('Irrigation controller initialized');
        return scheduleManager.loadSchedules()
    })
    .then(() => {
        logger.debug('Schedule data manager initialized');
        server.addRoute(new DevicesRoutes());
        server.addRoute(new ControllerRoutes());
        server.addRoute(new SystemRoutes());
        server.addRoute(new ScheduleRoutes());
        server.addRoute(new EventsRoutes());
        let port = process.env.PORT === undefined ? Settings.server.port : Number(process.env.PORT);
        server.listen(port);
        eventLogger.addEvent({
            eventSource: 'System',
            eventTime: new Date().getTime(),
            text: 'Server initialized',
            type: EventTypes.INFO
        }).catch(err => {
            throw err
        });
    }).catch((err) => {
        logger.error('Failed to initialize data managers');
        logger.error(err);
    });

