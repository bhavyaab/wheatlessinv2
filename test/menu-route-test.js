'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const User = require('../model/user.js');
const Biz = require('../model/biz.js');
const Menu = require('../model/menu.js');

const mockUser = require('./lib/mock-user.js');
const mockBiz = require('./lib/mock-biz.js');
require('./lib/test-env.js');
require('../server.js');

const exampleMenu = {
  isCompletelyGlutenFree: true
};

const url = `http://localhost:${process.env.PORT}`;

function cleanup() {
  return Promise.all([
    User.remove({}),
    Biz.remove({}),
    Menu.remove({})
  ]);
}

describe('Menu routes', () => {

  before( done => {
    mockUser()
    .then( newMockUser => {
      this.tempUser1 = newMockUser;
      mockBiz(newMockUser)
      .then( newMockBiz => {
        this.tempBiz1 = newMockBiz;
      });
    }).then( () => {
      mockUser()
      .then( newMockUser => {
        this.tempUser2 = newMockUser;
        mockBiz(newMockUser)
        .then( newMockBiz => {
          this.tempBiz2 = newMockBiz;
          done();
        });
      });
    }).catch(done);
  }); //before everything

  after( () => {
    cleanup();
  });

  describe('POST /api/biz/:bizId/menu', () => {

    after( () => {
      Menu.remove({});
    });

    describe('with valid auth and valid menu - no isCompletelyGlutenFree flag', () => {
      it('should return a new menu', done => {
        request.post(`${url}/api/biz/${this.tempBiz1._id.toString()}/menu`)
        .set({authorization: `Bearer ${this.tempUser1.token}`})
        .end( (err, res) => {
          if(err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body.bizId).to.equal(this.tempBiz1._id.toString());
          done();
        });
      });
    }); // valid auth and menu - no iCGF flag set

    describe('with valid auth and valid menu - iCGF flag set', () => {
      it('should return a new menu', done => {
        request.post(`${url}/api/biz/${this.tempBiz1._id.toString()}/menu`)
        .send(exampleMenu)
        // ('isCompletelyGlutenFree', exampleMenu.isCompletelyGlutenFree)
        .set({authorization: `Bearer ${this.tempUser1.token}`})
        .end( (err, res) => {
          if(err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body.bizId).to.equal(this.tempBiz1._id.toString());
          expect(res.body.isCompletelyGlutenFree).to.equal(exampleMenu.isCompletelyGlutenFree);
          done();
        });
      });
    }); // valid auth and invalid menu - iCGF flag set

    describe('with INVALID auth and valid menu', () => {
      it('should return a 401', done => {
        request.post(`${url}/api/biz/${this.tempBiz1._id.toString()}/menu`)
        .send(exampleMenu)
        // ('isCompletelyGlutenFree', exampleMenu.isCompletelyGlutenFree)
        .set({authorization: 'Bearer badtoken123'})
        .end( (err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(401);
          done();
        });
      });
    }); // invalid auth

    describe('with valid auth and non-owner business ID in URL', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/biz/${this.tempBiz2._id.toString()}/menu`)
        .send(exampleMenu)
        // ('isCompletelyGlutenFree', exampleMenu.isCompletelyGlutenFree)
        .set({authorization: `Bearer ${this.tempUser1.token}`})
        .end( (err, res) => {
          //expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); //valid auth, bad biz id

  }); // POST /api/menu

});
