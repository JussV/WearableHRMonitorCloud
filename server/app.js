/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';
import seedDatabaseIfNeeded from './config/seed';
import async from 'async';
var models = require('./api/heartrate/heartrate.model');

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// Setup server
var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app);
var schedule = require('node-schedule');

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });

  app.listen(5000, function() {
    //execute on every 5 hours
    schedule.scheduleJob('0 */5 * * * *', function() {
      let intervalInMinutes = 15;

      var o = {},
        self = this;
      o.map = function() {
        var minuteSubset;
        var mins = this.date.getMinutes();
        var numberOfMinuteSubsets = 60 / 15;
        var i;
        for(i = 1; i <= numberOfMinuteSubsets; i++) {
          if(i * 15 > mins) {
            minuteSubset = (i - 1) * 15;
            break;
          }
        }
        var time_at_minute = new Date(
          this.date.getFullYear(),
          this.date.getMonth(),
          this.date.getDate(),
          this.date.getHours(),
          minuteSubset);

        emit({time_at_minute, device: this.device, upid: this.uniquePhoneId}, {
          device: this.device,
          heartrate: this.value,
          date: this.date
        });
      };
      o.reduce = function(key, values) {
        var heartRateTotal = 0.0;
        var count = values.length;
        var heartrate = 0.0;
        values.forEach(function(value) {
          heartRateTotal = heartRateTotal + value.heartrate;
        });

        var result = {
          upid: key.upid,
          date: key.time_at_minute,
          heartrate: heartRateTotal / count,
          dateToMilliSec: key.time_at_minute.getTime(),
          device: key.device,
          values: values
        };
        return result;
      };

      async.waterfall([
        function(callback) {
          models.MapReducedHeartRates15.findOne({}, {}, { sort: {'_id.time_at_minute': -1} }, function(err, lastMappedRecord) {
            if(err) {
              return callback(err);
            } else {
              o.out = {
                query: {
                  value: {$ne: 0},
                  date: {$gt: new Date(lastMappedRecord.toObject().value.dateToMilliSec + 15 * 60 * 1000)}
                },
                reduce: 'heartrates-mapreduce-15',
                scope: {'interval': 15}
              };
              return callback(null, lastMappedRecord);
            }
          });
        },
        function(lastMappedRecord, callback) {
          models.Heartrate.mapReduce(o, function(err, results) {
            if(err) {
              return callback(err);
            } else {
              return callback(null, results);
            }
          });
        }
      ], function(err, result) {
        if(err) {
          console.log('error:' + err);
        }
        console.log(result);
      });
    });
  });
}

seedDatabaseIfNeeded();
setImmediate(startServer);

// Expose app
exports = module.exports = app;
