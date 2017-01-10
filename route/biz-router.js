'use strict';

const Router = require('express').Router;

const bizRouter = module.exports = Router();

//TODO: Add bearerAuth
bizRouter.post('/api/biz', function(req, res, next) {
  //TODO: Implement POST /api/biz
  //TODO: create a biz with req.body
  next();
});

bizRouter.get('/api/biz/:id', function(req, res, next) {
  //TODO: Biz.findById()....
  next();
});

bizRouter.delete('/api/biz/:id', function(req, res, next) {
  //TODO: Biz.findByIdAndRemove(req.params.id) ....
  next();
});

// bizRouter.get('/api/biz/search', function(req, res, next) {
bizRouter.get('/api/biz', function(req, res, next) {
  //TODO: look for search params. If no search params, show a list of all biz's?
  next();
});
