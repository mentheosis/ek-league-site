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
	parent: {
		type: String,
		default: '',
		trim: true
	},
	link: {
		type: String
	},
	replies: {
		type: Number,
		default: 0
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
	imageurl: {
		type: String,
		default: '',
		trim: true
	}
});

mongoose.model('Article', ArticleSchema);
