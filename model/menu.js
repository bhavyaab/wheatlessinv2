//Kyler Dotson
'use strict';

const Mongoose = require('mongoose');

module.exports = Mongoose.model('menu', Mongoose.Schema({
  picID: { type: String, required: true, unique: true },
  businessID: { type: Mongoose.Schema.Types.ObjectId, required: true },
  isCompletelyGlutenFree: { type: Boolean, required: true },
  created: { type: Date, default: Date.now }
}));
