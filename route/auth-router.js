'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('wheatlessinv2:auth-router');
const createError = require('http-errors');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const User = require('../model/user.js');

const authRouter = module.exports = new Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST /api/signup');

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

//TODO: Replace basicAuth with POST and no middleware.
authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET /api/signin');

  User.findOne({ username: req.auth.username })
  .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch( err => next(createError(401, err.message)));
});

//DONE: User PUT to update
authRouter.put('/api/signin', bearerAuth, jsonParser, function(req, res, next) {
  debug('GET /api/signin');

  User.findById(req.user._id)
  .then( user => {
    for(var prop in user){
      if(req.body[prop]) user[prop] = req.body[prop];
    }
    return res.json(user);
  })
  .catch( err => next(createError(404, err.message)));
});
