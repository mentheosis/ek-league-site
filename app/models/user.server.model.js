'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */

var UserSchema = new Schema({
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		unique: 'Username already exists',
		required: 'Please fill in a username',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	},
	address: {
		type: String,
		default: '1234567890',
	},
	privKey: {
		type: String,
		default: '0987654321',
	},
	kismet: {
		type: Number,
		default: 0
	}
});


/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(null, possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(err);
		}
	});
};






//UserSchema.methods.giveKismetTo = function(username, amount, callback) {
//	var _this = this;
//	_this.findOne({
//		username : username
//	}, function(err, user) {
//		if (err) { return callback(err); }
//		if (user) {
//			user.kismet++;
//			_this.kismet--;
//			//call wallet API to send tokens, sign with token
//		} else {
//			callback('user does not exist');
//		}
//	});
//};

mongoose.model('User', UserSchema);

////////////////
//OLD USER Schema
////////////////
//var UserSchema = new Schema({
//	firstName: {
//		type: String,
//		trim: true,
//		default: '',
//		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
//	},
//	lastName: {
//		type: String,
//		trim: true,
//		default: '',
//		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
//	},
//	displayName: {
//		type: String,
//		trim: true
//	},
//	email: {
//		type: String,
//		trim: true,
//		default: '',
//		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
//		match: [/.+\@.+\..+/, 'Please fill a valid email address']
//	},
//	username: {
//		type: String,
//		unique: 'Username already exists',
//		required: 'Please fill in a username',
//		trim: true
//	},
//	password: {
//		type: String,
//		default: '',
//		validate: [validateLocalStrategyPassword, 'Password should be longer']
//	},
//	salt: {
//		type: String
//	},
//	provider: {
//		type: String,
//		required: 'Provider is required'
//	},
//	providerData: {},
//	additionalProvidersData: {},
//	roles: {
//		type: [{
//			type: String,
//			enum: ['user', 'admin']
//		}],
//		default: ['user']
//	},
//	updated: {
//		type: Date
//	},
//	created: {
//		type: Date,
//		default: Date.now
//	},
//	/* For reset password */
//	resetPasswordToken: {
//		type: String
//	},
//	resetPasswordExpires: {
//		type: Date
//	},
//	address: {
//		type: String,
//		default: '1234567890',
//	},
//	privKey: {
//		type: String,
//		default: '0987654321',
//	},
//	kismet: {
//		type: Number,
//		default: 0
//	}
//});
