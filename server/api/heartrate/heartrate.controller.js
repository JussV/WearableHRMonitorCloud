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
import Heartrate from './heartrate.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
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
  return Heartrate.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Heartrate from the DB
export function show(req, res) {
  return Heartrate.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Heartrate in the DB
export function create(req, res) {
  return Heartrate.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}


// Bulk insert of Heart-rates in the DB
export function bulkCreate(req, res) {
  return Heartrate.insertMany(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Get date of latest synced heart rate by uniquePhoneId
export function latestSyncDate(req, res) {
  return Heartrate.findOne({ uniquePhoneId: req.query.upid }, {}, { sort: {date: -1} })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Heartrate in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Heartrate.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Heartrate in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Heartrate.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Heartrate from the DB
export function destroy(req, res) {
  return Heartrate.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
