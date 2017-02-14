'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose.model('pic', mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  bizId: { type: Schema.Types.ObjectId, required: true },
  imageURI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: false },
  created: { type: Date, default: Date.now }
}));
