'use strict';

const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:menu-router');

const Menu = require('../model/menu.js');
const Biz = require('../model/biz.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const menuRouter = module.exports = Router();

menuRouter.post('/api/biz/:bizId/menu', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/biz/:bizId/menu');

  let tempBiz;
  let tempMenu;
  Biz.findById(req.params.bizId)
  .then( biz => {
    if (!biz) return createError(400, 'Business Does Not Exist');
    if (biz.userId.toString() !== req.user._id.toString()) {
      return Promise.reject(next(createError(400, 'Invalid User')));
    }
    tempBiz = biz;
    req.body.bizId = biz._id;
    return new Menu(req.body).save();
  })
  .then( menu => {
    tempMenu = menu;
    return tempBiz.update({menu: menu._id});
  })
  .then( () => {
    res.json(tempMenu);
  })
  .catch(next);
});

menuRouter.get('/api/biz/:bizId/menu', bearerAuth, function(req, res, next) {
  debug('GET /api/biz/:bizId/menu');

  Biz.findById(req.params.bizId)
  .then( foundBiz => {
    if(!foundBiz) return new Error();
    debug('found biz:', foundBiz);
    Menu.findById(foundBiz.menu)
    .then( foundMenu => res.json(foundMenu))
    .catch(err => next(createError(404, `could not find menu: ${err.message}`)));
  })
  .catch(err => next(createError(404, `could not find business: ${err.message}`)));

});
