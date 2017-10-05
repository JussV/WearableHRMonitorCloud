'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var heartrateCtrlStub = {
  index: 'heartrateCtrl.index',
  show: 'heartrateCtrl.show',
  create: 'heartrateCtrl.create',
  upsert: 'heartrateCtrl.upsert',
  patch: 'heartrateCtrl.patch',
  destroy: 'heartrateCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var heartrateIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './heartrate.controller': heartrateCtrlStub
});

describe('Heartrate API Router:', function() {
  it('should return an express router instance', function() {
    expect(heartrateIndex).to.equal(routerStub);
  });

  describe('GET /api/heartrates', function() {
    it('should route to heartrate.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'heartrateCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/heartrates/:id', function() {
    it('should route to heartrate.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'heartrateCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/heartrates', function() {
    it('should route to heartrate.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'heartrateCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/heartrates/:id', function() {
    it('should route to heartrate.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'heartrateCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/heartrates/:id', function() {
    it('should route to heartrate.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'heartrateCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/heartrates/:id', function() {
    it('should route to heartrate.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'heartrateCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
