/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/heartrates              ->  index
 * POST    /api/heartrates              ->  create
 * GET     /api/heartrates/:id          ->  show
 * PUT     /api/heartrates/:id          ->  upsert
 * PATCH   /api/heartrates/:id          ->  patch
 * DELETE  /api/heartrates/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
var models = require('./heartrate.model');
import _ from 'lodash';
import async from 'async';
import Device from '../device/device.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function respondWithBulkResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entities) {
    if(entities !== null) {
      var responseObj = { length: entities.length, array: entities };
      return res.status(statusCode).json(responseObj);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Heartrates
export function index(req, res) {
  return models.Heartrate.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Heartrate from the DB
export function show(req, res) {
  return models.Heartrate.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Heartrate in the DB
export function create(req, res) {
  return models.Heartrate.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Show heartrates for all devices for the last 3 days
export function heartRatesByStartDateByEndDateByUniquePhoneId(req, res) {
  let start = new Date();
  start.setDate(start.getDate() - 15);
  let end = new Date();
  let user = req.user;
  let uniquePhoneId = user.uniquePhoneId;
  if(req.query.startDate) {
    start = new Date(Number(req.query.startDate));
  }
  if(req.query.endDate) {
    end = new Date(Number(req.query.endDate));
  }

  var aggregation = models.Heartrate.aggregate([
    { $match: {
      uniquePhoneId: uniquePhoneId,
      $and: [{date: {$gte: start}}, {date: {$lte: end}}]}
    },
    { $project: { _id: 1, date: 1, value: 1, device: 1, index: { $const: [0, 1] }, dateToMilliSec: { $subtract: ['$date', new Date('1970-01-01T00:00:00.000Z')] } } },
    { $unwind: '$index' },
    { $group: {
      _id: { device: '$device', id: '$_id' },
      data: {
        $push: { $cond: [{$eq: ['$index', 0]}, '$dateToMilliSec', '$value'] }
      },
    }},
    { $sort: { _id: 1 } },
    { $group: {
      _id: '$_id.device',
      data: { $push: '$data' },
      count: { $sum: 1 }
    }},
    {
      $lookup: {
        from: 'devices',
        localField: '_id',
        foreignField: 'key',
        as: 'device'
      }
    }
  ]);
  aggregation.options = { allowDiskUse: true };
  aggregation.exec(function(err, resultArr) {
    if(err) {
      return handleError(res, 500);
    } else {
      res.jsonp(resultArr);
      return respondWithResult(res, 201);
    }
  });
}

export function showHeartrateStatisticsbByInterval(req, res) {
  let startDate = Number(req.query.startDate);
  let endDate = Number(req.query.endDate);
  let uniquePhoneId = req.user.uniquePhoneId;

  models.MapReducedHeartRates15.find({'_id.upid': uniquePhoneId, '_id.time_at_minute': {$gte: new Date(startDate), $lt: new Date(endDate)}}, {}, {sort: {'_id.time_at_minute': 1}})
    .exec(function(err, resultArr) {
      if(err) {
        return handleError(res, 500);
      } else {
        async.waterfall([
          function findUniqueDevices(callback) {
            let devices = _.uniqBy(resultArr, function(item) {
              return item.toObject().value.device;
            });
            callback(null, devices);
          }, function getDevicesFromDB(devices, callback) {
            let devicesWithNames = [];
            Device.find({}, function(err, devicesFromDB) {
              if(err) {
                return callback(err);
              } else {
                devices.forEach(function(item) {
                  let deviceName = _.find(devicesFromDB, {key: item.toObject().value.device}).name;
                  var devWithName = { key: item.toObject().value.device, name: deviceName};
                  devicesWithNames.push(devWithName);
                  if(devices.length === devicesWithNames.length) {
                    //foreach work done
                    return callback(null, devicesWithNames);
                  }
                });
              }
            });
          },
          function filterArrayByDevices(devicesWithNames, callback) {
            let tmpArray = [];
            devicesWithNames.forEach(function(deviceItem) {
            //  let deviceItemKey = deviceItem.toObject().value.device;
              let obj = {device: deviceItem};
              async.map(resultArr, function(item, cb) {
                if(item.toObject().value.device === deviceItem.key) {
                  let row = [item.toObject().value.dateToMilliSec, item.toObject().value.heartrate];
                  return cb(null, row);
                } else {
                  return cb(null);
                }
              }, function(error, results) {
                if(error) {
                  return callback(error);
                } else {
                  async.filter(results, function(item, cb) {
                    cb(null, item != undefined);
                  }, function(err, finalResult) {
                    if (err) {
                      return callback(err);
                    } else {
                      obj.heartrates = finalResult;
                      tmpArray.push(obj);
                    }
                  });
                }
              });
            });
            callback(null, tmpArray);
          }
        ], function(err, result) {
          if(err) {
            return handleError(res, 500);
          } else {
            res.jsonp(result);
            return respondWithResult(res, 201);
          }
        });
      }
    });


}


export function cronJobMapReduceHeartRatesByInterval(req, res) {
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;
  let intervalInMinutes = req.body.interval;

  var map = function() {
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

  var reduce = function(key, values) {
    var heartRateTotal = 0.0;
    var count = values.length;
    var heartrate = 0.0;
    var device = key.device;
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
      //  count: count,
    };
    return result;
  };

  models.Heartrate.mapReduce(
    map,
    reduce,
    {
      query: {value: {$ne: 0} },
      out: 'resultOfMapReduce',
      scope: {interval: intervalInMinutes}
    }
  );
}

// Bulk insert of Heart-rates in the DB
export function bulkCreate(req, res) {
  return models.Heartrate.insertMany(req.body.heartrates)
    .then(respondWithBulkResult(res))
    .catch(handleError(res));
}

// Get date of latest synced heart rate by uniquePhoneId
export function latestSyncDate(req, res) {
  return models.Heartrate.findOne({ uniquePhoneId: req.query.upid, device: req.query.device }, {}, { sort: {date: -1} })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Heartrate in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return models.Heartrate.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Heartrate in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return models.Heartrate.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Heartrate from the DB
export function destroy(req, res) {
  return models.Heartrate.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
