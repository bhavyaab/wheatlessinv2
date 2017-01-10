'use strict';

const Biz = require('../../model/biz.js');
const debug = require('debug')('wheatlessinv2:mock-biz');

var num = 0;

module.exports = function(user) {
  debug('mock-biz');
  num++;
  return new Biz({
    userId: user._id.toString(),
    EIN: '11-345678' + num,
    loc: {
      lat: 47.6182206,
      lng: -122.3540207
    },
    name: 'Kylers salmonella buffet' + num,
    address: '123 fake st, seattle wa 98123' + num,
    url: 'http://www.food.com' + num,
    email: 'food@food.food' + num,
    phone: '123-456-789' + num
  }).save().then( savedUser => {
    return savedUser;
  })
  .catch();
};
//
// const exampleBusiness = {
//   EIN: '11-3456789',
//   loc: {
//     lat: 47.6182206,
//     lng: -122.3540207
//   },
//   name: 'Kylers salmonella buffet',
//   address: '123 fake st, seattle wa 98123',
//   url: 'http://www.food.com',
//   email: 'food@food.food',
//   phone: '123-456-7890'
// };
// const exampleBusiness2 = {
//   EIN: '10-3456789',
//   loc: {
//     lat: 47.6182206,
//     lng: -122.3540207
//   },
//   name: 'Kylers salmonella buffet',
//   address: '123 fake st, seattle wa 98123',
//   url: 'http://www.food.com',
//   email: 'food@food.food',
//   phone: '123-456-7890'
// };
//
// before( done => {
//   //Toggle.serverOn(Server, done);
//
//   mockUser().then( newUser => {
//     this.tempUser = newUser;
//     return this.tempUser;
//   })
//   .then( tempUser => {
//     exampleBusiness.userId = tempUser._id;
//     new Biz(exampleBusiness).save()
//     .then( savedBiz => {
//       exampleMenu.bizId = savedBiz._id;
//       this.tempBiz = savedBiz;
//       done();
//     }).catch(done);
//   }).catch(done);
//
// }); //before everything
