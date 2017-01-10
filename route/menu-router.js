'use strict';

const Router = require('express').Router;
// const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:menu-router');

const Menu = require('../model/menu.js');
const Biz = require('../model/biz.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const menuRouter = module.exports = Router();

menuRouter.post('/api/biz/:bizId/menu', bearerAuth, function(req, res, next) {
  debug('POST /api/biz/:bizId/menu');

  let tempBiz;
  let tempMenu;
  Biz.findById(req.params.bizId)
  .then( biz => {
    tempBiz = biz;
    let menuData = {
      bizId: req.params.bizId
      // isCompletelyGlutenFree: req.body.isCompletelyGlutenFree
    };
    return new Menu(menuData).save();
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
