'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newHeartrate;

describe('Heartrate API:', function() {
  describe('GET /api/heartrates', function() {
    var heartrates;

    beforeEach(function(done) {
      request(app)
        .get('/api/heartrates')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          heartrates = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(heartrates).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/heartrates', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/heartrates')
        .send({
          name: 'New Heartrate',
          info: 'This is the brand new heartrate!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newHeartrate = res.body;
          done();
        });
    });

    it('should respond with the newly created heartrate', function() {
      expect(newHeartrate.name).to.equal('New Heartrate');
      expect(newHeartrate.info).to.equal('This is the brand new heartrate!!!');
    });
  });

  describe('GET /api/heartrates/:id', function() {
    var heartrate;

    beforeEach(function(done) {
      request(app)
        .get(`/api/heartrates/${newHeartrate._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          heartrate = res.body;
          done();
        });
    });

    afterEach(function() {
      heartrate = {};
    });

    it('should respond with the requested heartrate', function() {
      expect(heartrate.name).to.equal('New Heartrate');
      expect(heartrate.info).to.equal('This is the brand new heartrate!!!');
    });
  });

  describe('PUT /api/heartrates/:id', function() {
    var updatedHeartrate;

    beforeEach(function(done) {
      request(app)
        .put(`/api/heartrates/${newHeartrate._id}`)
        .send({
          name: 'Updated Heartrate',
          info: 'This is the updated heartrate!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedHeartrate = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedHeartrate = {};
    });

    it('should respond with the updated heartrate', function() {
      expect(updatedHeartrate.name).to.equal('Updated Heartrate');
      expect(updatedHeartrate.info).to.equal('This is the updated heartrate!!!');
    });

    it('should respond with the updated heartrate on a subsequent GET', function(done) {
      request(app)
        .get(`/api/heartrates/${newHeartrate._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let heartrate = res.body;

          expect(heartrate.name).to.equal('Updated Heartrate');
          expect(heartrate.info).to.equal('This is the updated heartrate!!!');

          done();
        });
    });
  });

  describe('PATCH /api/heartrates/:id', function() {
    var patchedHeartrate;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/heartrates/${newHeartrate._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Heartrate' },
          { op: 'replace', path: '/info', value: 'This is the patched heartrate!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedHeartrate = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedHeartrate = {};
    });

    it('should respond with the patched heartrate', function() {
      expect(patchedHeartrate.name).to.equal('Patched Heartrate');
      expect(patchedHeartrate.info).to.equal('This is the patched heartrate!!!');
    });
  });

  describe('DELETE /api/heartrates/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/heartrates/${newHeartrate._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when heartrate does not exist', function(done) {
      request(app)
        .delete(`/api/heartrates/${newHeartrate._id}`)
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
