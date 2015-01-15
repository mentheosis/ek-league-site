'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	content: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	children: {
		type: Schema.ObjectId,
		ref: 'Article',
	},
	parent: {
		type: String,
		default: '',
		trim: true
	},
	edits: {
		type: Schema.ObjectId,
		ref: 'Article',
	},
	address: {
		type: String,
		default: 'an_article_address',
		trim: true,
	},
	kismet: {
		type: Number,
		default: 0,
	}
});

mongoose.model('Article', ArticleSchema);
