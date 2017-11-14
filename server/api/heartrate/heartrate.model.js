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
    index: true,
    default: Date.now()
  }
});

var MapReducedHeartRates15 = mongoose.model('MapReduce15', new mongoose.Schema(), 'heartrates-mapreduce-15');

module.exports = {
  Heartrate: mongoose.model('Heartrate', HeartrateSchema),
  MapReducedHeartRates15: MapReducedHeartRates15
}

registerEvents(HeartrateSchema);
//export default mongoose.model('Heartrate', HeartrateSchema);

