'use strict';

/**
* Module dependencies.
*/
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
	crypto = require('crypto');

var validateNameLength = function(name) {
	return name.length <= 25;
};

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
    required: 'Name cannot be blank',
		validate: [validateNameLength, 'Name must be 25 characters or less'],
    trim: true
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

/**
 * Create instance method for hashing a password
 */
TeamSchema.methods.hashPassword = function(password) {
	if (password) {
		return crypto.pbkdf2Sync(password, 'fakesalt'.toString('base64'), 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
TeamSchema.methods.authenticate = function(password) {
	return this.joinpw === this.hashPassword(password);
};


mongoose.model('Team', TeamSchema);
