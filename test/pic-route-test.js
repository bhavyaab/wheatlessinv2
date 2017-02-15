'use strict';

require('./lib/test-env.js');

const awsMocks = require('./lib/aws-mocks.js');
const expect = require('chai').expect;
const request = require('superagent');
//const debug = require('debug')('wheatlessinv2:pic-route-test');

const User = require('../model/user.js');
const Biz  = require('../model/biz.js');
const Pic  = require('../model/pic.js');

require('../server.js');

const mockUser = require('./lib/mock-user.js');

const url = `http://localhost:${process.env.PORT}`;

describe('Pic Routes', function() {
  before( done => {
    mockUser().then( user => {
      this.user = user;
      done();
    })
    .catch(done);
  });
  before( done => {
    new Biz({
      userId: this.user._id,
      name: 'Example Biz',
      EIN: '12-3456789',
      menuPics: []
    }).save()
    .then( biz => {
      this.biz = biz;
      done();
    })
    .catch(done);
  });
  // before( done => {
  //   new Menu({
  //     bizId: this.biz._id
  //   }).save()
  //   .then( menu => {
  //     this.menu = menu;
  //     done();
  //   })
  //   .catch(done);
  // }); //before
  after( () => {
    return Promise.all([
      User.remove({}),
      Biz.remove({}),
      //Menu.remove({}),
      Pic.remove({}),
      // Promise.resolve(del(`${dataDir}/*`))
    ]);
  });

  describe('POST /api/biz/:bizId/pic', () => {
    describe('with a bizId that does not exist', () => {
      it('should return a 404', done => {
        request.post(`${url}/api/biz/5876cb5ea93f1ce1001bb490/pic`)
        // request.post(`${url}/api/menu/not_a_valid_id/pic`)
        .set({ Authorization: `Bearer ${this.user.token}` })
        .attach('image', `${__dirname}/data/pic.jpg`)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    }); //menuId does not exist

    describe('with a bizId that is bogus', () => {
      it('should return a 404', done => {
        request.post(`${url}/api/biz/bogus/pic`)
        // request.post(`${url}/api/menu/not_a_valid_id/pic`)
        .set({ Authorization: `Bearer ${this.user.token}` })
        .attach('image', `${__dirname}/data/pic.jpg`)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    }); //bogus menuId

    describe('with a valid bizId and pic', () => {
      it('should return a pic array', done => {
        request.post(`${url}/api/biz/${this.biz._id}/pic`)
        .set({
          Authorization: `Bearer ${this.user.token}`
        })
        .attach('image', `${__dirname}/data/pic.jpg`)
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          this.picId = res.body._id;
          expect(res.body.bizId).to.equal(this.biz._id.toString());
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location);
          expect(res.body.objectKey).to.equal(awsMocks.uploadMock.Key);
          Biz.findById(this.biz._id).then( foundBiz => {
            expect(foundBiz.menuPics[0].toString()).to.equal(res.body._id);
          })
          .then(done);
        });
      });
    }); // valid menuId and pic
  }); // POST /api/menu/:menuId/pic

  describe('DELETE: /api/pic/:picId', () => {
    describe('with invalid picId and valid token', () => {
      it('should return res status 404', done => {
        request.delete(`${url}/api/pic/12345678901234`)
       .set({
         Authorization: `Bearer ${this.user.token}`
       })
       .end( (err, res) => {
         expect(res.status).to.equal(404);
         done();
       });
      });
    });

    describe('with valid picId and valid token', () => {
      it('should return res status 200', done => {
        request.delete(`${url}/api/pic/${this.picId}`)
       .set({
         Authorization: `Bearer ${this.user.token}`
       })
       .end( (err, res) => {
         if(err) return done(err);
         expect(res.status).to.equal(200);
         done();
       });
      });
    });
  });
});
