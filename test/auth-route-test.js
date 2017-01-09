'use strict';

require('./lib/test-env.js');

const expect = require('chai').expect;
const mongoose = require('mongoose');
const Promise = require('bluebird');
const request = require('superagent');
const User = require('../model/user.js');
const debug = require('debug')('wheatlessinv2:auth-route-test');

mongoose.Promise = Promise;
require('../server.js');
const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'test-User',
  password: '1234',
  email: 'test-user@test.com'
};

describe('Auth routes', function(){
  User.remove({});
  describe('POST: /api/signup', function(){
    after( done => {
      User.remove({})
      .then( () => done())
      .catch(done);
    });
    debug('POST: /api/signup');

    it('should say invalid path', done => {
      request.post(`${url}/api/sig`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

    it('should say body is invalid', done => {
      request.post(`${url}/api/signup`)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
    it('should return a token', done => {
      request.post(`${url}/api/signup`)
      .send(testUser)
      .end((err, res) => {
        if(err) return done(err);
        expect(res.status).to.equal(200);
        expect(res).to.have.property('text');
        done();
      });
    });
  });
  describe('GET: /api/signin', function(){
    debug('GET: /api/signin');
    before( done => {
      var user = new User(testUser);
      user.generatePasswordHash(user.password)
      .then( () => user.save())
      .then( () => user.generateToken())
      .then( token => {
        this.token = token;
        done();
      })
      .catch(done);
    });
    after( done => {
      User.remove({})
      .then( () => done())
      .catch(done);
    });
    it('should say invalid path', done => {
      request.get(`${url}/api/sig`)
      .set({Authorization: `Basic ${this.token}`})
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.text).to.equal('Cannot GET /api/sig\n');
        done();
      });
    });

    it('should say UnauthorizedError', done => {
      request.get(`${url}/api/signin`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        expect(res.text).to.equal('UnauthorizedError');
      });
      done();
    });
    it('should return a token', done => {
      request.get(`${url}/api/signin`)
      .set({Authorization: `Basic ${this.token}`})
      .send(testUser)
      .end((err, res) => {
        if(err) return done(err);
        expect(res.status).to.equal(200);
        expect(res).to.have.property('text');
      });
      done();
    });
  });
});
