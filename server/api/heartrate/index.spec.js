'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var heartrateCtrlStub = {
  bulkCreate: 'heartrateCtrl.bulkCreate',
  latestSyncDate: 'heartrateCtrl.latestSyncDate',
  heartRatesByStartDateByEndDateByUniquePhoneId: 'heartrateCtrl.heartRatesByStartDateByEndDateByUniquePhoneId',
  showHeartrateStatisticsbByInterval: 'heartrateCtrl.showHeartrateStatisticsbByInterval'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return `authService.hasRole.${role}`;
  }
};

var routerStub = {
  get: sinon.spy(),
  post: sinon.spy()
};

// require the index with our stubbed out modules
var heartrateIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './heartrate.controller': heartrateCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Heartrate API Router:', function() {
  it('should return an express router instance', function() {
    expect(heartrateIndex).to.equal(routerStub);
  });

  describe('GET /api/heartrates/sync/latest', function() {
    it('should route to heartrate.controller.latestSyncDate', function() {
      expect(routerStub.get
        .withArgs('/sync/latest', 'heartrateCtrl.latestSyncDate')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/heartrates/bulk', function() {
    it('should route to heartrate.controller.bulkCreate', function() {
      expect(routerStub.post
        .withArgs('/bulk', 'heartrateCtrl.bulkCreate')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/heartrates/show/chart', function() {
    it('should route to heartrate.controller.heartRatesByStartDateByEndDateByUniquePhoneId', function() {
      expect(routerStub.get
        .withArgs('/show/chart', 'authService.isAuthenticated', 'heartrateCtrl.heartRatesByStartDateByEndDateByUniquePhoneId')
        ).to.have.been.calledOnce;
    });
  });


  describe('GET /api/heartrates/show/interval/statistics/', function() {
    it('should route to heartrate.controller.showHeartrateStatisticsbByInterval', function() {
      expect(routerStub.get
        .withArgs('/show/interval/statistics/', 'authService.isAuthenticated', 'heartrateCtrl.showHeartrateStatisticsbByInterval')
        ).to.have.been.calledOnce;
    });
  });
});
