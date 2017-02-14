'use strict';

const AWS = require('aws-sdk-mock');
const debug = require('debug')('wheatlessinv2:aws-mocks');

const bucket = process.env.AWS_BUCKET;

module.exports = exports = {};

exports.randomize = function() {
  exports.uploadMock = randomMock();
  debug('new random AWS mock:', exports.uploadMock);
};

let randomMock = function() {
  let key = `${Math.random() + 1}.png`;
  return {
    ETag: '"1234abcd"',
    Location: `http://mockurl.com/${key}`,
    Key: key,
    key: key,
    Bucket: bucket
  };
};

exports.uploadMock = randomMock();

AWS.mock('S3', 'upload', function(params, callback) {
  debug('upload()');

  if(params.ACL !== 'public-read') {
    return callback(new Error('ACL must be public-read'));
  }
  if(params.Bucket !== bucket) {
    return callback(new Error(`Bucket must be ${bucket}`));
  }
  if(!params.Key) {
    return callback(new Error('Key required'));
  }
  if(!params.Body) {
    return callback(new Error('Body required'));
  }

  return callback(null, exports.uploadMock);
});

AWS.mock('S3', 'deleteObject', function(params, callback) {
  debug('deleteObject()');

  if(params.Bucket !== bucket) {
    return callback(new Error(`Bucket must be ${bucket}`));
  }
  if(!params.Key) {
    return callback(new Error('Key required'));
  }

  return callback(null, {});
});
