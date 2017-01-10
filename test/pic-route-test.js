'use strict';

require('./lib/test-env.js');

const awsMocks = require('./lib/aws-mocks.js');
const expect = require('chai').expect;
const request = require('superagent');
// const debug = require('debug')('wheatlessinv2:pic-route-test');

const User = require('../model/user.js');
const Biz  = require('../model/biz.js');
const Menu = require('../model/menu.js');
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
      EIN: '12-3456789'
    }).save()
    .then( biz => {
      this.biz = biz;
      done();
    })
    .catch(done);
  });
  before( done => {
    new Menu({
      bizId: this.biz._id
    }).save()
    .then( menu => {
      this.menu = menu;
      done();
    })
    .catch(done);
  }); //before
  after( () => {
    return Promise.all([
      User.remove({}),
      Biz.remove({}),
      Menu.remove({}),
      Pic.remove({}),
      // Promise.resolve(del(`${dataDir}/*`))
    ]);
  });

  describe('POST /api/menu/:menuId/pic', () => {
    describe('with a valid menuId and pic', () => {
      it('should return a pic object', done => {
        request.post(`${url}/api/${this.menu._id}/pic`)
        .set({
          Authorization: `Bearer ${this.user.token}`
        })
        .attach('image', `${__dirname}/data/pic.jpg`)
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.userId).to.equal(this.user._id.toString());
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location);
          expect(res.body.objectKey).to.equal(awsMocks.uploadMock.Key);
          done();
        });
      });
    }); // valid menuId and pic
  }); // POST /api/menu/:menuId/pic
});
