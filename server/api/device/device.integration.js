'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newDevice;

describe('Device API:', function() {
  describe('GET /api/devices', function() {
    var devices;

    beforeEach(function(done) {
      request(app)
        .get('/api/devices')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          devices = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(devices).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/devices', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/devices')
        .send({
          name: 'New Device',
          info: 'This is the brand new device!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newDevice = res.body;
          done();
        });
    });

    it('should respond with the newly created device', function() {
      expect(newDevice.name).to.equal('New Device');
      expect(newDevice.info).to.equal('This is the brand new device!!!');
    });
  });

  describe('GET /api/devices/:id', function() {
    var device;

    beforeEach(function(done) {
      request(app)
        .get(`/api/devices/${newDevice._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          device = res.body;
          done();
        });
    });

    afterEach(function() {
      device = {};
    });

    it('should respond with the requested device', function() {
      expect(device.name).to.equal('New Device');
      expect(device.info).to.equal('This is the brand new device!!!');
    });
  });

  describe('PUT /api/devices/:id', function() {
    var updatedDevice;

    beforeEach(function(done) {
      request(app)
        .put(`/api/devices/${newDevice._id}`)
        .send({
          name: 'Updated Device',
          info: 'This is the updated device!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedDevice = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedDevice = {};
    });

    it('should respond with the updated device', function() {
      expect(updatedDevice.name).to.equal('Updated Device');
      expect(updatedDevice.info).to.equal('This is the updated device!!!');
    });

    it('should respond with the updated device on a subsequent GET', function(done) {
      request(app)
        .get(`/api/devices/${newDevice._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let device = res.body;

          expect(device.name).to.equal('Updated Device');
          expect(device.info).to.equal('This is the updated device!!!');

          done();
        });
    });
  });

  describe('PATCH /api/devices/:id', function() {
    var patchedDevice;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/devices/${newDevice._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Device' },
          { op: 'replace', path: '/info', value: 'This is the patched device!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedDevice = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedDevice = {};
    });

    it('should respond with the patched device', function() {
      expect(patchedDevice.name).to.equal('Patched Device');
      expect(patchedDevice.info).to.equal('This is the patched device!!!');
    });
  });

  describe('DELETE /api/devices/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/devices/${newDevice._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when device does not exist', function(done) {
      request(app)
        .delete(`/api/devices/${newDevice._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
