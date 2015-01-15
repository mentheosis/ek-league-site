'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Article = mongoose.model('Article'),
	_ = require('lodash');

/**
 * Create a article
 */
exports.create = function(req, res) {
	var article = new Article(req.body);

	article.user = req.user;

	article.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
	res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
	var article = req.article;

	//console.log('resetting parent');
	//article.parent = '';//article.id;

	article = _.extend(article, req.body);

	article.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

exports.kismet = function(req, res) {
	console.log('articles.server.controller.kismet: sending kismet to: ' + req.article._id);

	var conditions = { _id: req.article._id };
	var update = { $inc: { kismet: 1 }};

	Article.update(conditions, update, function(err, article) {
		if (err) {
			console.log('articles.server.controller.kismet: findbyId ERROR: ' + err);
			return res.status(400).send({	message: errorHandler.getErrorMessage(err)	});
		} else if (!article) {
			console.log('articles.server.controller.kismet: ERROR: no article found for id: ' + req.article._id);
			return res.status(400).send(new Error('Article does not exist: ' + req.article._id));
		} else {
			res.status(200).send();
		}
	});




	//Article.findById(id).exec(function(err, article) {
	//	if (err) {
	//		console.log('articles.server.controller.kismet: findbyId ERROR: ' + err);
	//		return res.status(400).send({	message: errorHandler.getErrorMessage(err)	});
	//	} else if (!article) {
	//		console.log('articles.server.controller.kismet: ERROR: no article found for id: ' + id);
	//		return res.status(400).send(new Error('Failed to load article ' + id));
	//	} else {
	//		console.log('articles.server.controller.kismet: article: ' + JSON.stringify(article));
	//		//article = _.extend(article, req.body);
	//
	//		console.log('articles.server.controller.kismet: updating kismet' + article.kismet);
	//		article.save(function(err) {
	//			if (err) {
	//				console.log('articles.server.controller.kismet: save ERROR: ' + err);
	//				return res.status(400).send({
	//					message: errorHandler.getErrorMessage(err)
	//				});
	//			} else {
	//				console.log('articles.server.controller.kismet: new kismet' + JSON.stringify(article));
	//				res.json(article);
	//			}
	//		});
//
	//	}
//
	//});
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
	var article = req.article;

	article.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

/**
 * List of Articles
 */
exports.list = function(req, res) {
	var sortBy = req.query.sortBy;

	Article.find({parent:'top'}).sort(sortBy).populate('user', 'username').exec(function(err, articles) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(articles);
		}
	});
};

exports.listComments = function(req, res) {
//	console.log('list:');
//	console.log(JSON.stringify(req.query));

	Article.find({parent:req.param('parentId')}).sort('-created').populate('user', 'username').exec(function(err, articles) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(articles);
		}
	});
};

/**
 * Article middleware
 */
exports.articleByID = function(req, res, next, id) {
	Article.findById(id).populate('user', 'username').exec(function(err, article) {
		if (err) return next(err);
		if (!article) return next(new Error('Failed to load article ' + id));
		req.article = article;
		next();
	});
};

exports.articleByParent = function(req, res, next, id) {
	Article.where('parent').equals(id).populate('user', 'username').exec(function(err, article) {
		if (err) return next(err);
		if (!article) return next(new Error('Failed to load article ' + id));
		req.article = article;
		next();
	});
};
/**
 * Article authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.article.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
