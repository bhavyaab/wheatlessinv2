'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:search-router');

const Biz = require('../model/biz.js');

const searchRouter = module.exports = Router();

//PUBLIC access to search, although we may want to try to lock down the CORS
searchRouter.get('/api/search', function(req, res, next) {
  debug('GET /api/search');
  if(!req.query || req.query === {}) {
    return next(createError(400, 'missing query'));
  }

  if(!req.query.southwest) return next(createError(400, 'missing southwest'));
  if(!req.query.northeast) return next(createError(400, 'missing northeast'));

  let lowerLeft  = req.query.southwest.split(',');
  let upperRight = req.query.northeast.split(',');

  if(!isValidLoc(lowerLeft) || !isValidLoc(upperRight)) {
    return next(createError(400, 'coordinates out of bounds'));
  }

  Biz.where('loc')
  .within().box(lowerLeft, upperRight)
  .then( bizs => res.json(bizs))
  .catch(next);
});

function isValidLoc(loc) {
  return isValidLatitude(loc[0]) && isValidLongitude(loc[1]);
}

function isValidLatitude(lat) {
  if(lat < -90 || lat > 90) return false;
  return true;
}

function isValidLongitude(lng) {
  if(lng < -180 || lng > 180) return false;
  return true;
}
