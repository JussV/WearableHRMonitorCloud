'use strict';

var express = require('express');
var controller = require('./heartrate.controller');

var router = express.Router();
import * as auth from '../../auth/auth.service';

/*router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);*/
router.post('/bulk', controller.bulkCreate);
router.get('/sync/latest', controller.latestSyncDate);
router.get('/show/chart', auth.isAuthenticated(), controller.heartRatesByStartDateByEndDateByUniquePhoneId);
//router.get('/cronjob/statistics', controller.cronJobMapReduceHeartRatesByInterval);
router.get('/show/interval/statistics/', auth.isAuthenticated(), controller.showHeartrateStatisticsbByInterval);

module.exports = router;
