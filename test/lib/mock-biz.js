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
  }).save();
};
