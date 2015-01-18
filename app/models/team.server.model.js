'use strict';

/**
* Module dependencies.
*/
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

/**
* Article Schema
*/
var TeamSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    default: '',
    trim: true,
    required: 'Name cannot be blank'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  founder: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  captains: {
    type: [{type: Schema.ObjectId, ref: 'User' }],
    default: []
  },
  joinpw: {
    type: String,
    default: ''
  },
  imageurl: {
    type: String,
    default: '',
    trim: true
  }
});

mongoose.model('Team', TeamSchema);
