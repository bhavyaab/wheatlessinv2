'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose.model('pic', mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  menuId: { type: Schema.Types.ObjectId, required: true },
  imageURI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now }
}));
