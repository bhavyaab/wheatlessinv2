'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const User = require('../model/user.js');

//TODO: Refactor to use our /lib helpers
require('./lib/test-env.js');
require('../server.js');

const exampleUser = {
  // username: 'theexampleplayer',
  email: 'somebody@example.com',
  password: '123abc'
};

const url = `http://localhost:${process.env.PORT}`;

function cleanup(done) {
  User.remove({})
  .then( () => done())
  .catch(done);
}

describe('Auth Routes', function() {
  after( done => cleanup(done));

  describe('GET /some/bogus/route', () => {
    it('should return a 404', done => {
      request.get(`${url}/some/bogus/route`)
      .end( (err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  }); // Bogus Routes

  describe('POST /api/signup', () => {
    describe('with a valid body', () => {

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end( (err, res) => {
          if(err) done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          this.token = res.text;
          console.log('token:',this.token);
          done();
        });
      });
    }); // valid body

    //--- No longer needed ----
    // describe('with a missing username', function() {
    //   after( done => cleanup(done)); //Just in case?
    //
    //   it('should return a 400', done => {
    //     request.post(`${url}/api/signup`)
    //     .send({ email: exampleUser.email, password: exampleUser.password })
    //     .end( (err, res) => {
    //       expect(res.status).to.equal(400);
    //       done();
    //     });
    //   });
    // }); // missing username

    describe('with a missing password', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/signup`)
        .send({ email: exampleUser.email })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // missing password

    describe('with a missing email', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/signup`)
        .send({ password: exampleUser.password })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // missing email
  }); // POST /api/signup

  describe('GET /api/signin', () => {
    // before( done => {
    //   let user = new User(exampleUser);
    //   user.generatePasswordHash(exampleUser.password)
    //   .then( user => user.save())
    //   .then( user => {
    //     this.tempUser = user;
    //     done();
    //   });
    // });
    //
    // after( done => cleanup(done));

    describe('with a valid email and password', () => {
      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth(exampleUser.email, exampleUser.password)
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    }); // valid username and password

    describe('with incorrect password', () => {
      it('should return a 401', done => {
        request.get(`${url}/api/signin`)
        .auth(exampleUser.email, 'not_the_real_password')
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    }); // incorrect password

    describe('unknown email', () => {
      it('should return a 401', done => {
        request.get(`${url}/api/signin`)
        .auth('not_a_real@email.com', exampleUser.password)
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    }); //unknown username
  }); // GET /api/signin

  //TODO: This should just be for changepass
  describe.skip('PUT /api/signin', () => {
    // before( done => {
    //   var user = new User(exampleUser);
    //   user.generatePasswordHash(exampleUser.password)
    //   .then( () => user.save())
    //   .then( () => user.generateToken())
    //   .then( token => {
    //     this.token = token;
    //     done();
    //   })
    //   .catch(done);
    // });
    //
    // after( done => {
    //   User.remove({})
    //   .then( () => done())
    //   .catch(done);
    // });

    let update = {
      email: 'update@example.com',
      password: 'updatePassword'
    };

    //NOTE: All unknown routes are handled in one place,
    //      so we really only need one 404 test.
    describe('with valid body and invalid path', () => {
      it('should expect res status 404', done => {
        request.put(`${url}/api/signin/updatenot`)
        .set({Authorization: `Bearer ${this.token}`})
        .send(update)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('with valid body and valid path invalid token', () => {
      it('should expect res status 401', done => {
        request.put(`${url}/api/signin`)
        .set({Authorization: 'Bearer 1234567890123456789'})
        .send(update)
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('with valid body and valid path', () => {
      it('should expect res status 200', done => {
        request.put(`${url}/api/signin`)
        .set({Authorization: `Bearer ${this.token}`})
        .send(update)
        .end( (err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.email).to.equal(update.email);
          expect(res.body.password).to.equal(update.password);
          done();
        });
      });
    });
  });
});
