'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Biz = require('../model/biz.js');

const bizRouter = module.exports = Router();

//Only authenticated users can create a biz.
bizRouter.post('/api/biz', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/biz');

  req.body.userId = req.user._id;
  new Biz(req.body).save()
  .then( biz => res.json(biz))
  .catch(next);
});

//PUBLIC, anyone can get a biz.
bizRouter.get('/api/biz/:id', function(req, res, next) {
  debug('GET /api/biz/:id', req.params.id);

  Biz.findById(req.params.id)
  .then( biz => res.json(biz))
  .catch( err => next(createError(404, err.message)));
});

//Only owner of biz can delete.
bizRouter.delete('/api/biz/:id', bearerAuth, function(req, res, next) {
  debug('DELETE /api/biz/:id');

  Biz.findById(req.params.id)
  .then( biz => {
    if(biz.userId.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user, not owner of biz'));
    }
    res.status(204).send('OK');
  })
  .catch( err => next(createError(404, err.message)));
});

//PUBLIC access to search, although we may want to try to lock down the CORS
// bizRouter.get('/api/biz/search', function(req, res, next) {
bizRouter.get('/api/biz', function(req, res, next) {
  //TODO: look for search params.
  //TODO: If no search params, should we show a list of all biz ids?
  //      That could mean a pretty big, unsorted list.
  //      I recommend that we require at least 1 search param.
  next();
});
