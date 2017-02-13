'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = Schema({
    //TODO: menuSchema needs to have an array of pics for multiple page menus
  picURI: { type: String },
  bizId: { type: Schema.Types.ObjectId, required: true },
  isCompletelyGlutenFree: { type: Boolean, default: false },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('menu', menuSchema);
