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
  lowername: {
    type: String,
    default: '',
    trim: true,
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
  members: {
    type: [{type: Schema.ObjectId, ref: 'User' }],
    default: []
  },
  joinpw: {
    type: String,
    default: ''
  },
  imageurl: {
    type: String,
    default: '/modules/teams/img/team-default.png',
    trim: true
  }
});

mongoose.model('Team', TeamSchema);
