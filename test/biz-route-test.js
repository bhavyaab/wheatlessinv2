'use strict';

require('./lib/test-env.js');

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('wheatlessinv2:Biz-router-test');
mongoose.Promise = Promise;

const geo = require('./lib/mock-geocoder.js');
const User = require('../model/user.js');
const Biz = require('../model/biz.js');

require('../server.js');

const examples = {
  'codefellows': {
    name: 'Code Fellows',
    EIN: '55-5556666',
    address: '2901 3rd Ave, Seattle, WA',
    url: 'https://www.codefellows.org/',
    phone: '206-555-9876'
  },
  'crocodile': {
    name: 'Crocodile',
    EIN: '66-6667777',
    address: '2200 2nd Ave, Seattle, WA'
  }
};

const url = `http://localhost:${process.env.PORT}/api/biz`;

const mockUser = require('./lib/mock-user.js');

describe('Biz-router-test', function(){
  before( done => {
    mockUser()
    .then( user => {
      this.token = user.token;
      this.userId = user._id;
      done();
    });
  });
  before( done => {
    mockUser()
    .then( user => {
      this.newToken = user.token;
      return User.findByIdAndRemove(user._id);
    })
    .then( () => done());
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
        .send(examples.codefellows)
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
        .send(examples.codefellows)
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
        .send(examples.codefellows)
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
        .send(examples.codefellows)
        .end( (err, res) => {
          if(err) return done(err);
          this.biz = res.body;
          debug('this.biz:',this.biz);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(examples.codefellows.name);
          expect(res.body.EIN).to.equal(examples.codefellows.EIN);
          expect(res.body).to.have.property('userId');
          expect(res.body.userId).to.equal(`${this.userId}`);
          expect(res.body.address).to.equal(examples.codefellows.address);
          expect(res.body.url).to.equal(examples.codefellows.url);
          expect(res.body.phone).to.equal(examples.codefellows.phone);
          let expectedLoc = geo(examples.codefellows.address)[0].location;
          expect(res.body.loc).to.deep.equal(expectedLoc);
          done();
        });
      });
    });
  });

  describe('GET: api/biz', () => {
    describe('valid token and biz exists', () => {
      it('should return an array of bizs', done => {
        request.get(url)
        .set({Authorization: `Bearer ${this.token}`})
        .end( (err, res) => {
          expect(res.body).to.be.an('array');
          //Currently only having a single biz per user,
          //but the route will return an array of 1 item.
          expect(res.body[0]).to.deep.equal(this.biz);
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
          expect(res.body.name).to.equal(examples.codefellows.name);
          expect(res.body._id).to.equal(`${this.biz._id}`);
          expect(res.body.EIN).to.equal(examples.codefellows.EIN);
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
        debug('this.biz:', this.biz);
        request.put(`${url}/${this.biz._id}`)
        .set({authorization: `Bearer ${this.token}`})
        //TODO: send and verify updates for all fields?
        .send({
          name: examples.crocodile.name,
          address: examples.crocodile.address
        })
        .end( (err, res) => {
          if(err) return done(err);
          debug('updated to:', res.body);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(examples.crocodile.name);
          expect(res.body._id).to.equal(`${this.biz._id}`);
          expect(res.body.address).to.equal(examples.crocodile.address);
          let expectedLoc = geo(examples.crocodile.address)[0].location;
          expect(res.body.loc).to.deep.equal(expectedLoc);
          done();
        });
      });
    }); //valid id, update address
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
