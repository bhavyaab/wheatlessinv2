'use strict';

const debug = require('debug')('wheatlessinv2:mock-geocoder');

const map = {
  '2901 3rd Ave, Seattle, WA': [{
    location: { lat: 47.618217, lng: -122.351832 }
  }],
  '2200 2nd Ave, Seattle, WA': [{
    location: { lat: 47, lng: -122 } //TODO: Replace with real values.
  }]
};

module.exports = function(address) {
  return map[address];
};

const geocoder = require('../../lib/geocoder.js');
// Taking over the find method.
geocoder.find = function(address) {
  debug('mock.find()', address);
  if(!address) return Promise.reject('address required');
  if(!map[address]) return Promise.reject('unknown address: ' + address);
  return Promise.resolve(map[address]);
};
