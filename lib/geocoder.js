'use strict';

const Promise = require('bluebird');
const geocoder = require('google-geocoder');
const geo = geocoder({ key: process.env.GOOGLE_GEOCODER_KEY });

module.exports = {
  find: function(address) {
    if(!address) return Promise.reject('address required');

    return new Promise( (resolve, reject) => {
      geo.find(address, (err, res) => {
        if(err) return reject(err);
        resolve(res);
      });
    });
  }
};  
