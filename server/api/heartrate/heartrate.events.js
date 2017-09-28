/**
 * Heartrate model events
 */

'use strict';

import {EventEmitter} from 'events';
var HeartrateEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
HeartrateEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Heartrate) {
  for(var e in events) {
    let event = events[e];
    Heartrate.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    HeartrateEvents.emit(event + ':' + doc._id, doc);
    HeartrateEvents.emit(event, doc);
  };
}

export {registerEvents};
export default HeartrateEvents;
