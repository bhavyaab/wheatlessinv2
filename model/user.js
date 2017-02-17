'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('wheatlessinv2:user');
const createError = require('http-errors');
const Schema = mongoose.Schema;

const userSchema = Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  findHash: { type: String, unique: true }
});

userSchema.methods.generatePasswordHash = function(password) {
  debug('generatePasswordHash()', this.email);

  return new Promise( (resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if(err) return reject(createError(400, 'hash failed'));
      this.password = hash;
      resolve(this);
    });
  });
};

userSchema.methods.comparePasswordHash = function(password) {
  debug('comparePasswordHash()', this.email);

  return new Promise( (resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(createError(401, 'invalid password'));
      resolve(this);
    });
  });
};

userSchema.methods.generateFindHash = function() {
  debug('generateFindHash()', this.email);

  return new Promise( (resolve, reject) => {
    let tries = 0;

    _generateFindHash.call(this);

    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex');
      debug('trying', this.findHash);
      this.save()
      .then( user => {
        debug('...success',user.findHash);
        resolve(this.findHash);
      })
      .catch( err => {
        debug('failed try',tries);
        if(tries > 3) return reject(err);
        tries++;
        _generateFindHash.call(this);
      })
      .finally( () => {
        debug('...finally done');
      });
    }
  });
};

userSchema.methods.generateToken = function() {
  debug('generateToken()', this.email);

  return new Promise( (resolve, reject) => {
    this.generateFindHash()
    .then( findHash => resolve(jwt.sign({ token: findHash }, process.env.APP_SECRET)))
    .catch( err => reject(err));
  });
};

module.exports = mongoose.model('user', userSchema);
