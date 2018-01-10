'use strict';

/* globals describe, expect, it, before, after, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';
var models = require('./heartrate.model');
import User from '../user/user.model';

describe('Heartrate API:', function() {
  var token;
  var user;
  before(function() {
    return models.Heartrate.remove()
      .then(() => {
        return models.Heartrate.create({
          date: new Date(),
          value: 84,
          uniquePhoneId: 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b',
          device: 11
        });
      });
  });

  // Clear users before testing
  before(function() {
    return User.remove().then(function() {
      user = new User({
        provider: 'local',
        role: 'user',
        name: 'test',
        email: 'test@example.com',
        uniquePhoneId: 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b',
        password: 'passpass'
      });

      return user.save();
    });
  });

  before(function(done) {
    request(app)
      .post('/auth/local')
      .send({
        email: 'test@example.com',
        password: 'passpass'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  after(function() {
    return models.Heartrate.remove();
  });

  after(function() {
    return User.remove();
  });

  describe('GET /api/heartrates/sync/latest', function() {
    var heartrates;
    beforeEach(function(done) {
      request(app)
        .get('/api/heartrates/sync/latest')
        .query({upid: 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b', device: 11})
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            console.log(err);
            return done(err);
          }
          heartrates = res.body;
          done();
        });
    });

    it('should respond with JSON object', function() {
      expect(heartrates).to.be.instanceOf(Object);
    });
  });

  describe('POST /api/heartrates/bulk', function() {
    var result;
    var date = new Date();
    date.setDate(date.getDate() - 1);
    beforeEach(function(done) {
      request(app)
        .post('/api/heartrates/bulk')
        .set('Content-Type', 'application/json')
        .send({heartrates: [{
          date: date,
          value: 84,
          uniquePhoneId: 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b',
          device: 11
        }, {
          date: date,
          value: 88,
          uniquePhoneId: 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b',
          device: 11
        }, {
          date: date,
          value: 101,
          uniquePhoneId: 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b',
          device: 11
        }, {
          date: new Date(),
          value: 72,
          uniquePhoneId: 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b',
          device: 11
        }, {
          date: new Date(),
          value: 81,
          uniquePhoneId: 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b',
          device: 11
        }]})
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            console.log(err);
            return done(err);
          }
          result = res.body;
          console.log(result);
          done();
        });
    });

    it('should respond with object that returns number of inserted records', function() {
      expect(result).to.be.instanceOf(Object);
      expect(result.length).to.equal(5);
    });
  });

  describe('GET /api/heartrates/show/chart', function() {
    var heartrates;

    beforeEach(function(done) {
      request(app)
        .get('/api/heartrates/show/chart')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          heartrates = res.body;
          console.log(heartrates);
          done();
        });
    });

    it('should respond with heartrate array', function() {
      expect(heartrates).to.be.instanceOf(Array);
    });
  });

  describe('GET /api/heartrates/show/chart', function() {
    var heartrates;

    beforeEach(function(done) {
      request(app)
        .get('/api/heartrates/show/chart')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          heartrates = res.body;
          console.log(heartrates);
          done();
        });
    });

    it('should respond with heartrate array', function() {
      expect(heartrates).to.be.instanceOf(Array);
    });
  });

  describe('GET /api/heartrates/show/interval/statistics/', function() {
    let result;
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 10);
    let endDate = new Date();
    beforeEach(function(done) {
      request(app)
        .get('/api/heartrates/show/interval/statistics/')
        .set('authorization', 'Bearer ' + token)
        .query({startDate: startDate, endDate: endDate, interval: 15})
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          result = res.body;
          done();
        });
    });

    it('should respond with warning that no data are found', function() {
      expect(result).to.be.instanceOf(Object);
      expect(result.warning).to.equal('There are no results for specified dates.');
    });
  });
});
