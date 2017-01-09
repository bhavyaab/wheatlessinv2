//Kyler Dotson
'use strict';

const Mongoose = require('mongoose');

module.exports = Mongoose.model('menu', Mongoose.Schema({
  picId: { type: String, required: true, unique: true },
  businessId: { type: Mongoose.Schema.Types.ObjectId, required: true },
  isCompletelyGlutenFree: { type: Boolean, required: true },
  created: { type: Date, default: Date.now }
}));
