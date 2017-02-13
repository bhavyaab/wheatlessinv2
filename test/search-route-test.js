'use strict';

const debug = require('debug')('wheatlessinv2:search-route-test');
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const User = require('../model/user.js');
const Biz = require('../model/biz.js');

require('../server.js');
// const server = require('../server.js');
// const serverToggle = require('./lib/server-toggle.js');

const url = `http://localhost:${process.env.PORT}/api/biz`;

const mockUser = require('./lib/mock-user.js');

const south = 47.6071014;
const west = -122.3565892;

const north = 47.6267425;
const east = -122.3192424;
const queryContains = {
  southwest: `${south},${west}`,
  northeast: `${north},${east}`
};

const queryNotContains = {
  southwest: '50,-100.1',
  northeast: '50.1,-100'
};

describe('Search Route', function() {
  // before( done => {
  //   serverToggle()
  // })
  before( done => {
    mockUser().then( user => {
      this.tempUser = user;
      done();
    })
    .catch(done);
  });
  before( done => {
    new Biz({
      userId: this.tempUser._id,
      name: 'Code Fellows',
      EIN: '12-3456789',
      loc: {
        lat: 47.6182206,
        lng: -122.3540207
      }
    }).save()
    .then( biz => {
      this.tempBiz = biz;
      done();
    })
    .catch(done);
  });
  after( () => {
    return Promise.all([
      User.remove({}),
      Biz.remove({})
    ]);
  });

  describe('GET /api/biz?southwest=<lat,lng>&norteast=<lat,lng>', () => {
    describe('with a valid box, containing an item', () => {
      it('should return a list of items', done => {
        request.get(url)
        .query(queryContains)
        .end( (err, res) => {
          debug('search results:', res.body);
          expect(res.status).to.equal(200);
          expect(res.body).to.have.length(1);
          expect(res.body[0].userId).to.equal(this.tempUser._id.toString());
          expect(res.body[0].EIN).to.equal(this.tempBiz.EIN);
          expect(res.body[0]._id).to.equal(this.tempBiz._id.toString());
          done();
        });
      });
    }); // valid box

    describe('with a box that contains no items', () => {
      it('should return an empty list', done => {
        request.get(url)
        .query(queryNotContains)
        .end( (err, res) => {
          debug('search results:', res.body);
          expect(res.status).to.equal(200);
          expect(res.body).to.have.length(0);
          done();
        });
      });
    }); // empty box

    describe('missing southwest', () => {
      it('should return a 400', done => {
        request.get(url)
        .query({ northeast: `${north},${east}` })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          //TODO: check the res.text for correct error msg.
          done();
        });
      });
    }); // missing southwest

    describe('missing northeast', () => {
      it('should return a 400', done => {
        request.get(url)
        .query({ southwest: `${south},${west}` })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          //TODO: check the res.text for correct error msg.
          done();
        });
      });
    }); // missing northeast

    describe('contains out of bounds latitude', () => {
      it('should return a 400', done => {
        request.get(url)
        .query({
          southwest: `${south},${west}`,
          northeast: '150,100' //150 > 90
        })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          //TODO: check the res.text for correct error msg.
          done();
        });
      });
    }); // invalid latitude

    describe('contains out of bounds longitude', () => {
      it('should return a 400', done => {
        request.get(url)
        .query({
          southwest: `${south},${west}`,
          northeast: '45,500' //500 > 180
        })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          //TODO: check the res.text for correct error msg.
          done();
        });
      });
    }); // invalid longitude

    //
    // describe('box size exceeds max area', () => {
    //
    // }); // box exceeds max size

    describe('missing query', () => {
      it('should return a 400', done => {
        request.get(url)
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          //TODO: check the res.text for correct error msg.
          done();
        });
      });
    }); // missing query
  }); // GET /api/biz?southwest=<lat,lng>&norteast=<lat,lng>
});
