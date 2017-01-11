'use strict';

const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:menu-router');

const Menu = require('../model/menu.js');
const Biz = require('../model/biz.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const menuRouter = module.exports = Router();

menuRouter.post('/api/biz/:bizId/menu', jsonParser, bearerAuth, function(req, res, next) {
  debug('POST /api/biz/:bizId/menu');

  let tempBiz;
  let tempMenu;
  Biz.findById(req.params.bizId)
  .then( biz => {
    if (!biz) return next(createError(400, 'Business Does Not Exist'));
    if (biz.userId.toString() !== req.user._id.toString()) {
      return Promise.reject(next(createError(400, 'Invalid User')));
    }
    tempBiz = biz;
    req.body.bizId = biz._id;
    return new Menu(req.body).save();
  })
  .then( menu => {
    tempMenu = menu;
    tempBiz.menuId = menu._id;
    return tempBiz.save();
  })
  .then( () => {
    res.json(tempMenu);
  })
  .catch( err => next(err));
});
