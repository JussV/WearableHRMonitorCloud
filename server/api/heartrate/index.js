'use strict';

var express = require('express');
var controller = require('./heartrate.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);
router.post('/bulk', controller.bulkCreate);
router.get('/sync/latest', controller.latestSyncDate);

module.exports = router;
