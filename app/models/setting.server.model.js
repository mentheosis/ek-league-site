'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var SettingSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  edited: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    default: '',
    trim: true
  },
  name: {
    type: String,
    default: '',
    trim: true,
    required: 'Name cannot be blank'
  },
  value: {
    type: [String],
    default: '',
    trim: true
  }
});

mongoose.model('Setting', SettingSchema);
