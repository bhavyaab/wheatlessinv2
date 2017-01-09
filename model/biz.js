'use strict';

const createError = require('http-errors');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
//TODO: Confirm debug prefix
const debug = require('debug')('wheatlessin:biz');

const bizSchema = Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  created: { type: Date, default: Date.now },
  // geo: { Type: LAT_LONG } //TODO: Lookup geo Schema
  address: { Type: String }, //TODO: Breakdown address into address object
  //TODO: Consider allowing more than one menu per biz.
  menu: { Type: Schema.Types.ObjectId },
  url: { Type: String },
  phone: { Type: String }
});

module.exports = mongoose.model('biz', bizSchema);
