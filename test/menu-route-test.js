'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const User = require('../model/user.js');
const Biz = require('../model/biz.js');
const Menu = require('../model/menu.js');

const Toggle = require('./lib/server-toggle.js');
require('./lib/test-env.js');
const Server = require('../server.js');

const exampleUser = {
  username: 'theexampleplayer',
  email: 'somebody@example.com',
  password: '123abc'
};
const exampleMenu = {
  isCompletelyGlutenFree: true,
};
const exampleBusiness = {
  name: 'Kylers salmonella buffet',
  EIN: '123-456-78',
  address: '123 fake st, seattle wa 98123',
  url: 'http://www.food.com',
  email: 'food@food.food',
  phone: '123-456-7890'
};
//const examplePicPath = `${__dirname}/pic.jpg`;

const url = `http://localhost:${process.env.PORT}`;

function cleanup(done) {
  Biz.remove({});
  User.remove({});
  Menu.remove({});
  done();
}

describe('Menu routes', function() {

  before( done => {
    Toggle.serverOn(Server, done);

    new User(exampleUser)
    .hashPassword(exampleUser.password)
    .then( newUser => newUser.save())
    .then( savedUser => {
      this.tempUser = savedUser;
      exampleBusiness.userId = savedUser._id;
      return this.tempUser.generateToken();
    })
    .then( generatedToken => {
      this.tempToken = generatedToken;

      new Biz(exampleBusiness).save()
      .then( savedBiz => {
        exampleMenu.bizId = savedBiz._id;
        this.tempBiz = savedBiz;
        done();
      })
      .catch(err => done(err));

      done();
    })
    .catch(err => done(err));
  }); //before everything

  after( done => {
    Toggle.serverOn(Server, done);
  }); //after everything

  describe('POST /api/menu', function() {

    before( done => {
      //this.tempMenu = new Menu(exampleMenu).save();
      done();
    });

    after( done => cleanup(done));

    describe('with valid auth and valid menu', () => {
      it('should return a new menu', done => {
        request.post(`${url}/api/biz/${this.tempBiz._id.toString()}/menu`)
        .set({authorization: `Bearer ${this.tempToken}`})
        .send()
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
      });
    }); // valid auth and menu

    // describe('with valid auth and INVALID menu', () => {
    //   it('should return a new menu', done => {
    //     request.get(`${url}/api/menu`)
    //     .auth(exampleUser.username, exampleUser.password)
    //     .send()
    //     .end( (err, res) => {
    //       //TODO: fill stufff in
    //       done();
    //     });
    //   });
    // }); // valid auth and invalid menu
    //
    // describe('with INVALID auth and valid menu', () => {
    //   it('should return a 401', done => {
    //     request.get(`${url}/api/signin`)
    //     .auth(exampleUser.username, 'not_the_real_password')
    //     .end( (err, res) => {
    //       expect(res.status).to.equal(401);
    //       done();
    //     });
    //   });
    // }); // invalid auth
    //
    // describe('unknown username', () => {
    //   it('should return a 401', done => {
    //     request.get(`${url}/api/signin`)
    //     .auth('not_a_user', exampleUser.password)
    //     .end( (err, res) => {
    //       expect(res.status).to.equal(401);
    //       done();
    //     });
    //   });
    // }); //unknown username

  }); // POST /api/menu

});
