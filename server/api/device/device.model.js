'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './device.events';

var DeviceSchema = new mongoose.Schema({
  name: String,
  key: Number,
  active: Boolean,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

registerEvents(DeviceSchema);
export default mongoose.model('Device', DeviceSchema);
