'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bizSchema = Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  created: { type: Date, default: Date.now },
  name: { type: String, required: true },
  EIN: { type: String, required: true, unique: true,
    validate: {
      validator: function(v) {
        return /\d{2}-\d{7}/.test(v);
      },
      message: 'Not a valid EIN'
    }
  },
  loc: {
    lng: { type: Number, min: -180, max: 180 },
    lat: { type: Number, min: -90, max: 90 }
  },
  address: { type: String },
  menuPics : [{ type: Schema.Types.ObjectId, ref: 'pic' }],
  url: { type: String },
  email: { type: String },
  phone: { type: String }
});

bizSchema.index({ 'loc': '2d' });

module.exports = mongoose.model('biz', bizSchema);
