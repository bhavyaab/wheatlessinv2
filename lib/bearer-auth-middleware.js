'use strict';

const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:bearer-auth-middleware');
const User = require('../model/user.js');

module.exports = function(req, res, next){
  debug('working...');

  var authHeader = req.headers.authorization;
  if(!authHeader) return next(createError(401, 'authHeader required'));

  var token = authHeader.split('Bearer ')[1];
  if(!token) return next(createError(401, 'token required'));

  jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
    if(err) return next(createError(401, err.message));
    User.findOne({findHash: decoded.token})
    .then( user => {
      //NOTE: Mongoose is returning null, rather than throwing an err.
      if(user === null) return next(createError(400, 'No user for token'));
      req.user = user;
      next();
    })
    .catch( err => {
      next(createError(401, err.message));
    });
  });
};
