'use strict';

const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:Bearer-Auth');
const User = require('../model/user.js');

module.exports = function(req, res, next){
  debug('Bearer-Auth: function');

  var authHeader = req.headers.authorization;
  if(!authHeader) return next(createError(401, 'authHeader required'));

  var token = authHeader.split('Bearer ')[1];
  if(!token) return next(createError(410, 'token required'));

  jwt.verify(token, process.env.APP_SECRET, (err, decoder) => {
    if(err) return next(err);
    User.findOne({findHash: decoder.token})
    .then( user => {
      req.user = user;
      next();
    })
    .catch( err => {
      next(createError(401, err.message));
    });
  });
};
