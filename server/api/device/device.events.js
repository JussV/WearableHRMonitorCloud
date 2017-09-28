/**
 * Device model events
 */

'use strict';

import {EventEmitter} from 'events';
var DeviceEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
DeviceEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Device) {
  for(var e in events) {
    let event = events[e];
    Device.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    DeviceEvents.emit(event + ':' + doc._id, doc);
    DeviceEvents.emit(event, doc);
  };
}

export {registerEvents};
export default DeviceEvents;
