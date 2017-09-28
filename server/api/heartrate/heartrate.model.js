'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './heartrate.events';

var HeartrateSchema = new mongoose.Schema({
  value: Number,
  device: { type: Number, ref: 'DeviceSchema.key' },
  uniquePhoneId: String,
  active: {
    type: Boolean,
    default: true
  },
  date: Date,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

registerEvents(HeartrateSchema);
export default mongoose.model('Heartrate', HeartrateSchema);
