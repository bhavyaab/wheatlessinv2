'use strict';

const geocoder = require('google-geocoder');

module.exports = function() {
  let geo = geocoder({ key: process.env.GOOGLE_GEOCODER_KEY });

  return {
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
};
