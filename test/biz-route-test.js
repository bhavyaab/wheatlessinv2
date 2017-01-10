'use strict';

require('./lib/test-env.js');


//TODO: biz route test

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('wheatlessinv2:Biz-router-test');
mongoose.Promise = Promise;

const User = require('../model/user.js');
const Biz = require('../model/biz.js');

require('../server.js');

const testUser = {
  username: 'testUser',
  email: 'testUser@test.com',
  password: '123abc'
};
const testbiz = {
  name: 'test-biz',
  EIN: '01-2345678',
};
const url = `http://localhost:${process.env.PORT}/api/biz`;

describe('Biz-router-test', function(){
  debug('bizRouter');
  before( done => {
    var user = new User(testUser);
    user.generatePasswordHash(testUser.password)
    .then( () => user.save())
    .then( () => user.generateToken())
    .then( token => {
      this.token = token;
      this.userId = user._id;
      done();
    })
    .catch(done);
  });
  before( done => {
    testbiz.userId = this.userId;
    var biz = new Biz(testbiz);
    biz.save()
    .then( biz => {
      this.biz = biz;
      done();
    })
    .catch(done);
  });
  before( done => {
    var newUser = new User({
      username: 'FakeUser',
      email: 'fakeUser@test.com',
      password: 'fake'});
    newUser.generatePasswordHash(testUser.password)
    .then( () => newUser.save())
    .then( () => newUser.generateToken())
    .then( token => {
      this.newToken = token;
      User.findByIdAndRemove(newUser._id, function (err, user) {
        user.remove();
        done();
      });
    })
    .catch(done);
  });

  after( done => {
    User.remove({})
    .then( () => done())
    .catch(done);
  });
  after( done => {
    Biz.remove({})
    .then( () => done())
    .catch(done);
  });
  describe('Biz:POST route', () => {
    debug('Biz: POST route');
    it('POST: test for invalid path', done => {
      debug('valid body with invalid request');
      request.post(`${url}/abcd`)
      .send({
        name: 'testBiz',
        EIN: '98-7654321',
      })
      .end( (err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
    it('POST: test for missing token', done => {
      debug('valid body with invalid request');
      request.post(`${url}`)
      .send({
        name: 'testBiz',
        EIN: '98-7654321',
      })
      .end( (err, res) => {
        expect(res.status).to.equal(401);
        expect(res.text).to.equal('UnauthorizedError');
        done();
      });
    });
    it('POST: test for invalid token', done => {
      debug('valid body with invalid request');
      request.post(`${url}`)
      .set({Authorization: `Bearer ${this.newToken}`})
      .send({
        name: 'testBiz',
        EIN: '98-7654321',
      })
      .end( (err, res) => {
        expect(res.status).to.equal(404);
        expect(res.text).to.equal('Not Found');
        done();
      });
    });
    it('POST: missing body', done => {
      debug('missing body with valid request');
      request.post(`${url}`)
      .set({Authorization: `Bearer ${this.token}`})
      .end( (err, res) => {
        expect(res.text).to.equal('BadRequestError');
        expect(res.status).to.equal(400);
        done();
      });
    });
    it('should POST biz', done => {
      debug('valid body with valid request');
      request.post(`${url}`)
      .set({Authorization: `Bearer ${this.token}`})
      .send({
        name: 'testBiz',
        EIN: '98-7654321',
      })
      .end( (err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal( 'testBiz');
        expect(res.body.EIN).to.equal('98-7654321');
        expect(res.body).to.have.property('userId');
        expect(res.body.userId).to.equal(`${this.userId}`);
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
  describe('GET: api/biz/:id', () => {
    debug('GET: Route test');
    it('GET: should check for route invalid path', done => {
      request.get(`http://localhost:${process.env.PORT}/api/bizzz`)
      .set({Authorization: `Bearer ${this.token}`})
      .end( (err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
      it('GET: should check for route invalid token', done => {
        request.get(`${url}`)
        .set({Authorization: `Bearer ${this.newToken}`})
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
