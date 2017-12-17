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
    //execute at 5 AM every day
    let intervals = ['15', '30', '60'];
    let modelArr = [models.MapReducedHeartRates15, models.MapReducedHeartRates30, models.MapReducedHeartRates60];
    let collections = ['heartrates-mapreduce-15', 'heartrates-mapreduce-30', 'heartrates-mapreduce-60'];
    let delay = 0;
    let runJobAtHour = 5;
    let runJobAtMin = 0;
    async.eachOfSeries(intervals, function(item, index, finalCallback) {
      runJobAtMin = runJobAtMin + delay;
      if(runJobAtMin > 60) {
        runJobAtHour = runJobAtHour + 1;
        runJobAtMin = runJobAtMin - 60;
      }
      schedule.scheduleJob(item, {hour: runJobAtHour, minute: runJobAtMin}, function() {
        let intervalInMin = parseInt(item);
        var o = {},
          self = this;
        o.map = function() {
          var minuteSubset;
          var mins = this.date.getMinutes();
          var numberOfMinuteSubsets = 60 / interval;
          var i;
          for(i = 1; i <= numberOfMinuteSubsets; i++) {
            if(i * interval > mins) {
              minuteSubset = (i - 1) * interval;
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
            // values: values
          };
          return result;
        };

        async.waterfall([
          function(callback) {
            modelArr[index].findOne({}, {}, { sort: {'_id.time_at_minute': -1} }, function(err, lastMappedRecord) {
              if(err) {
                return callback(err);
              } else {
                return callback(null, lastMappedRecord);
              }
            });
          },
          function(lastMappedRecord, callback) {
            let scope = {}
            scope.interval = intervalInMin;
            let dateCondition = {$gt: new Date(lastMappedRecord.toObject().value.dateToMilliSec + intervalInMin * 60 * 1000)};
            o.query = {
              value: {$gt: 0},
              date: dateCondition,
            };
            o.out = { reduce: collections[index]};
            o.scope = {interval: intervalInMin};
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
            //   console.log('error:' + err);
          }
          console.log(result);
        });
        delay = delay + 15;
        finalCallback();
      });
    });
  });
}

seedDatabaseIfNeeded();
setImmediate(startServer);

// Expose app
exports = module.exports = app;
