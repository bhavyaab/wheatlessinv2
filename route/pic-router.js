'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('wheatlessinv2:pic-router');
const jsonParser = require('body-parser').json();
const Promise = require('bluebird');

const Biz = require('../model/biz.js');
const Pic  = require('../model/pic.js');

AWS.config.setPromisesDependency(Promise);

const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });
const bearerAuth = require('../lib/bearer-auth-middleware.js');

function s3uploadProm(params) {
  let s3 = new AWS.S3(); //Moving s3 here allows the mocks to work.
  debug('s3uploadProm', params.Key);
  return new Promise( (resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if(err) return reject(err);
      resolve(s3data);
    });
  });
}

// function s3deleteProm(params) {
//   let s3 = new AWS.S3();
//   debug('s3deleteProm', params);
//   return new Promise( (resolve, reject) => {
//     s3.deleteObject(params, (err, s3data) => {
//       if(err) return reject(err);
//       // TODO: check s3data for success.
//       debug('deleteObject s3data', s3data);
//       resolve(s3data);
//     });
//   });
// }

const picRouter = module.exports = Router();

picRouter.post('/api/biz/:bizId/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST /api/biz/:bizId/pic', req.params.bizId);

  debug('req.params:', req.params);

  if (!req.file) {
    return next(createError(400, 'file not found'));
  }

  if (!req.file.path) {
    return next(createError(500, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  let tempBiz;
  let tempPic;
  Biz.findById(req.params.bizId)
  .catch( () => next(createError(404, `cannot find biz: ${req.params.bizId}`)))
  .then( foundBiz => {
    if(!foundBiz) return Promise.reject(createError(404, 'biz not found'));
    tempBiz = foundBiz;
    return s3uploadProm(params);
  })
  .then( s3data => {
    debug('s3data:', s3data);

    tempPic = new Pic({
      userId: req.user._id,
      bizId: req.params.bizId,
      imageURI: s3data.Location,
      objectKey: s3data.Key
    });

    return tempPic.save()
    .then( savedPic => {
      tempBiz.menuPics.push(savedPic._id);
    })
    .then(tempBiz.save)
    .then( () => {
      del(req.file.path);
      return tempPic;
    });

  })
  .then( pic => res.json(pic))
  .catch(err => debug(err));
});
//pic could be deleted by only authenticated user

//TODO: implement delete for multiple pics, remove the pic from the biz's pic array
picRouter.delete('/api/pic/:picId', bearerAuth, jsonParser, function(req, res, next){
  debug('DELETE api/pic/:picId');

  if(!req.user) return Promise.reject(createError(404, 'not found'));
  Pic.findById(req.params.picId)
  .then( pic => {
    if(`${req.user._id}` != `${pic.userId}`) return Promise.reject(createError(403, 'access denied'));
    var params = {
      Bucket: process.env.AWS_BUCKET,
      Key: pic.objectKey
    };
    return params;
  })
  .then( params => {
    let s3 = new AWS.S3();
    s3.deleteObject(params, function(err, data) {
      if(err) return Promise.reject(createError(404, 'delete request failed'));
      return res.json(data);
    });
  })
  //TODO: Need to actually remove the pic from mongo.
  .catch(err => next(createError(404, err.message)));
});

picRouter.get('/api/biz/:bizId/pic', (req, res, next) => {
  debug('GET /api/biz/:bizId/pic');

  Biz.findById(req.params.bizId)
  .then( foundBiz => {
    res.send(foundBiz.menuPics);
    next();
  });
});
