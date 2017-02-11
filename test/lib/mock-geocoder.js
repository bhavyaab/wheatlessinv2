'use strict';

const mock = module.exports = {
  location: {
    lat: 47,
    lng: -122
  }
};

const geocoder = require('../../lib/geocoder.js');
//Taking over the find method.
geocoder.find = function() {
  return Promise.resolve(mock);
};
