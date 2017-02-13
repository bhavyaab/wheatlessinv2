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
  describe('Biz:POST :/api/biz', () => {
    describe('invalid path', () => {
      it('should expect 404 status', done => {
        request.post(`${url}/abcd`)
        .send({
          name: 'testBiz',
          EIN: '98-7654321',
        })
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          expect(res.text).to.equal('Cannot POST /api/biz/abcd\n');
          done();
        });
      });
    });
    describe('missing token', () => {
      it('should expect 401 status', done => {
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
    });
    describe('invalid token', () => {
      it('expect 400 status', done => {
        request.post(`${url}`)
        .set({Authorization: `Bearer ${this.newToken}`})
        .send({
          name: 'testBiz',
          EIN: '98-7654321',
        })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('missing body', () => {
      it('should 400 status', done => {
        request.post(`${url}`)
        .set({Authorization: `Bearer ${this.token}`})
        .end( (err, res) => {
          expect(res.text).to.equal('BadRequestError');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('valid post', () => {
      it('should status 200', done => {
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
  });
  describe('GET: api/biz/:id', () => {
    describe('invalid path', () => {
      it('expect error 404', done => {
        request.get(`http://localhost:${process.env.PORT}/api/bizzz`)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('invalid id', () => {
      it('expect res status 404', done => {
        request.get(`${url}/'58756$$$38b87e0ef8482***'`)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('valid id', () => {
      it('expect res status 200', done => {
        request.get(`${url}/${this.biz._id}`)
        .end( (err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(testbiz.name);
          expect(res.body._id).to.equal(`${this.biz._id}`);
          expect(res.body.EIN).to.equal(testbiz.EIN);
          done();
        });
      });
    });
  });
  describe('PUT: api/biz/:id', () => {
    describe(' invalid path', () => {
      it('expect error 404', done => {
        request.put(`http://localhost:${process.env.PORT}/api/bizzz`)
        .set({authorization: `Bearer ${this.token}`})
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          expect(res.text).to.equal('Cannot PUT /api/bizzz\n');
          done();
        });
      });
    });
    describe('invalid id', () => {
      it('expect res status 404', done => {
        request.put(`${url}/'58756$$$38b87e0ef8482***'`)
        .set({authorization: `Bearer ${this.token}`})
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          expect(res.text).to.equal('NotFoundError');
          done();
        });
      });
    });
    describe('valid id invalid token', () => {
      it('expect res status 400', done => {
        request.put(`${url}/${this.biz._id}`)
        .set({authorization: `Bearer ${this.newToken}`})
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          expect(res.text).to.equal('BadRequestError');
          done();
        });
      });
    });
    describe('valid id', () => {
      it('expect res status 200', done => {
        request.put(`${url}/${this.biz._id}`)
        .set({authorization: `Bearer ${this.token}`})
        .end( (err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(testbiz.name);
          expect(res.body._id).to.equal(`${this.biz._id}`);
          expect(res.body.EIN).to.equal(testbiz.EIN);
          done();
        });
      });
    });
  });
  describe('DELETE: api/biz/:id', () => {
    describe('invalid path', () => {
      it('res status 404', done => {
        request.delete(`http://localhost:${process.env.PORT}/put/bizzz`)
        .set({Authorization: `Bearer ${this.token}`})
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          expect(res.text).to.equal('Cannot DELETE /put/bizzz\n');
          done();
        });
      });
    });
    describe('invalid token', () => {
      it('res status 400', done => {
        debug('valid body with invalid request');
        request.delete(`${url}/${this.biz._id}`)
        .set({Authorization: `Bearer ${this.newToken}`})
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          expect(res.text).to.equal('BadRequestError');
          done();
        });
      });
    });
    describe('invalid id', () => {
      it('expect res status 404 ', done => {
        request.delete(`${url}/58756$$$38b87e0ef8482***`)
        .set({Authorization: `Bearer ${this.token}`})
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          expect(res.text).to.equal('NotFoundError');
          done();
        });
      });
    });
    describe('valid id', () => {
      it('expect res status 204', done => {
        request.delete(`${url}/${this.biz._id}`)
        .set({Authorization: `Bearer ${this.token}`})
        .end( (err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
  });
});
