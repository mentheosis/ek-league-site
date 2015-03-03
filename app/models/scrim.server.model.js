'use strict';

/**
* Module dependencies.
*/
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var ScrimSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  team: {
    type: String,
    default: '',
    trim: true,
    //required: 'Team cannot be blank'
  },
  map: {
    type: String,
    default: '',
    trim: true,
    required: 'Map cannot be blank'
  },
  format: {
    type: String,
    default: '',
    trim: true,
    required: 'Format cannot be blank'
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  imageurl: {
    type: String,
    default: '',
    trim: true
  },
  replies: {
    type: [String],
    default: []
  },
  acceptedUser: {
    type: String,
    default: ""
  },
  acceptMessage: {
    type: String,
    default: ""
  }
});

mongoose.model('Scrim', ScrimSchema);
