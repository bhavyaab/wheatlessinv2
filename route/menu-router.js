'use strict';

// const fs = require('fs');
// const path = require('path');
// const del = require('del');
const AWS = require('aws-sdk');
// const multer = require('multer');
const Router = require('express').Router;
// const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:menu-router');

const Menu = require('../model/menu.js');
const Biz = require('../model/biz.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

// const s3 = new AWS.S3();
// const dataDir = `${__dirname}/../data`;
// const upload = multer({ dest: dataDir });

const menuRouter = module.exports = Router();

// function s3uploadProm(params) {
//   return new Promise((resolve, reject) => {
//     s3.upload(params, (err, s3data) => {
//       resolve(s3data);
//     });
//   });
// }

// menuRouter.post('/api/biz/:bizId/menu', bearerAuth, upload.single('image'), function(req, res, next) {
menuRouter.post('/api/biz/:bizId/menu', bearerAuth, function(req, res, next) {
  debug('POST /api/biz/:bizId/menu');

  // if (!req.file) {
  //   return next(createError(400, 'file not found'));
  // };
  //
  // if (!req.file.path) {
  //   return next(createError(500, 'file not saved'));
  // };
  //
  // let ext = path.extname(req.file.originalname);
  //
  // let params = {
  //   ACL: 'public-read',
  //   Bucket: process.env.AWS_BUCKET,
  //   Key: `${req.file.filename}${ext}`,
  //   Body: fs.createReadStream(req.file.path)
  // };
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
