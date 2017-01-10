//Kyler Dotson
'use strict';

const Mongoose = require('mongoose');

module.exports = Mongoose.model('menu', Mongoose.Schema({
  //TODO: picId -> pic: { type: ObjectId }
  picId: { type: String, required: true, unique: true },
  //TODO: A menu could have multiple "pages", so an array of pics.
  businessId: { type: Mongoose.Schema.Types.ObjectId, required: true },
  isCompletelyGlutenFree: { type: Boolean, required: true },
  created: { type: Date, default: Date.now }
}));
