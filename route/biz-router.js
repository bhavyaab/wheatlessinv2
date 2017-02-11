'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:biz-router');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const geocoder = require('../lib/geocoder.js');
const Biz = require('../model/biz.js');

const bizRouter = module.exports = Router();

//Only authenticated users can create a biz.
bizRouter.post('/api/biz', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/biz');

  req.body.userId = req.user._id;
  debug('body:', req.body);
  let biz = new Biz(req.body);

  new Promise( (resolve, reject) => {
    if(req.body.address) {
      debug('finding address:',req.body.address);
      return geocoder.find(req.body.address)
      .then( geodata => {
        debug('geodata:', geodata);
        biz.loc = geodata.location;
        resolve(biz);
      })
      //TODO OR should we silently fail?
      .catch( err => reject(err));
    }
    resolve(biz);
  })
  .then( biz => biz.save())
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
//only authenticated business can can update a biz.
bizRouter.put('/api/biz/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT /api/biz/:id', req.params.id);

  Biz.findById(req.params.id)
  .catch( err => next(createError(404, err.message)))
  .then( biz => {
    if(`${req.user._id}` !== `${biz.userId}`) return Promise.reject(createError(403, 'access denied'));
    // debug('before:',biz);
    // debug('req.body.address:',req.body.address);
    let addr = biz.address;
    //TODO: Add a isChanged bool to decide if a save is necessary.
    for(let prop in req.body) {
      debug('updating:',biz[prop],'->',req.body[prop]);
      biz[prop] = req.body[prop];
    }
    // debug('after:',biz);
    if(biz.address !== addr) {
      return geocoder.find(biz.address)
      .then( geodata => {
        debug('new geodata:', geodata);
        biz.loc = geodata.location;
        return biz.save();
      })
      .catch(next);
    }
    //TODO: if(!isChanged) return Promise.resolve(biz);
    return biz.save();
  })
  .then( biz => res.json(biz))
  .catch(next);
});
//Only owner of biz can delete.
bizRouter.delete('/api/biz/:id', bearerAuth, function(req, res, next) {
  debug('DELETE /api/biz/:id');

  Biz.findById(req.params.id)
  .then( biz => {
    if(biz.userId.toString() !== req.user._id.toString()) {
      return next(createError(403, 'invalid user, not owner of biz'));
    }
    return Biz.findByIdAndRemove(req.params.id);
  })
  .then( () => res.status(204).send('OK'))
  .catch( err => next(createError(404, err.message)));
});

//PUBLIC access to search, although we may want to try to lock down the CORS
bizRouter.get('/api/biz', function(req, res, next) {
  debug('GET /api/biz q:', req.query);
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
