'use strict';

const debug = require('debug')('wheatlessinv2:menu-route-test');
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const User = require('../model/user.js');
const Biz = require('../model/biz.js');
const Menu = require('../model/menu.js');

//const Toggle = require('./lib/server-toggle.js');
const mockUser = require('./lib/mock-user.js');
require('./lib/test-env.js');
//const Server = require('../server.js');
require('../server.js');

const exampleMenu = {
  isCompletelyGlutenFree: true,
};
const exampleBusiness = {
  EIN: '11-3456789',
  loc: {
    lat: 47.6182206,
    lng: -122.3540207
  },
  name: 'Kylers salmonella buffet',
  address: '123 fake st, seattle wa 98123',
  url: 'http://www.food.com',
  email: 'food@food.food',
  phone: '123-456-7890'
};
//const examplePicPath = `${__dirname}/pic.jpg`;

const url = `http://localhost:${process.env.PORT}`;

function cleanup() {
  return Promise.all([
    User.remove({}),
    Biz.remove({}),
    Menu.remove({})
  ]);
}

describe('Menu routes', function() {

  before( done => {
    //Toggle.serverOn(Server, done);

    mockUser().then( newUser => {
      this.tempUser = newUser;
      return this.tempUser;
    })
    .then( tempUser => {
      exampleBusiness.userId = tempUser._id;
      new Biz(exampleBusiness).save()
      .then( savedBiz => {
        exampleMenu.bizId = savedBiz._id;
        this.tempBiz = savedBiz;
        done();
      }).catch(done);
    }).catch(done);

  }); //before everything

  after(cleanup);

  describe('POST /api/biz/:bizId/menu', () => {

    // before( done => {
    //   this.tempMenu = new Menu(exampleMenu).save();
    //   done();
    // });

    //after( done => cleanup(done));

    describe('with valid auth and valid menu', () => {
      it('should return a new menu', done => {
        request.post(`${url}/api/biz/${this.tempBiz._id.toString()}/menu`)
        .field('isCompletelyGlutenFree', exampleMenu.isCompletelyGlutenFree)
        .set({authorization: `Bearer ${this.tempUser.token}`})
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.bizId).to.equal(this.tempBiz._id.toString());
          expect(res.body.isCompletelyGlutenFree).to.equal(exampleMenu.isCompletelyGlutenFree);
          done();
        });
      });
    }); // valid auth and menu

    describe('with valid auth and INVALID menu', () => {
      it('should return a new menu', done => {
        request.get(`${url}/api/menu`)
        .auth(exampleUser.username, exampleUser.password)
        .send()
        .end( (err, res) => {
          //TODO: fill stufff in
          done();
        });
      });
    }); // valid auth and invalid menu

    describe('with INVALID auth and valid menu', () => {
      it('should return a 401', done => {
        request.get(`${url}/api/signin`)
        .auth(exampleUser.username, 'not_the_real_password')
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    }); // invalid auth

    describe('unknown username', () => {
      it('should return a 401', done => {
        request.get(`${url}/api/signin`)
        .auth('not_a_user', exampleUser.password)
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    }); //unknown username

  }); // POST /api/menu

});
