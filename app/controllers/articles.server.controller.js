'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Article = mongoose.model('Article'),
	_ = require('lodash');


function initializeArticleReplyCounts(){
	Article.find({}).sort('-created').limit('25').populate('user', 'username avatar')
	.exec(function(err, articles) {
		if (err) {
			console.log(err);
			return;
		} else {

			for (var a in articles) {
				countArticleReplies(articles[a])
			}
			return;
		}
	});
}

function countArticleReplies(article) {
	Article.count({parent:article._id},
	function(err,ct){
		article.replies = ct;
		article.save(function(err) {
			if (err) {
				console.log('err ' + err);
				return;
			} else {
				//console.log(article.title + ' ' + ct)
			}
		});
	});
}

//initialize on server start
initializeArticleReplyCounts();

function updateParentReplies(parentId) {
	Article.findById(parentId).exec(function(err, article) {
		if (err) return;
		if (!article) return;
		article.replies = article.replies + 1;
		article.save(function(err) {
			//console.log('updated parent reply count');
		})
});}


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
			updateParentReplies(article.parent);
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
	Article.find({parent:req.query.parent}).sort(req.query.sortBy).limit(req.query.limit).populate('user', 'username avatar')
	.exec(function(err, articles) {
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

	Article.find({parent:req.param('parentId')}).sort('-created').populate('user', 'username avatar').exec(function(err, articles) {
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
	Article.findById(id).populate('user', 'username avatar').exec(function(err, article) {
		if (err) return next(err);
		if (!article) return next(new Error('Failed to load article ' + id));
		req.article = article;
		next();
	});
};

exports.articleByParent = function(req, res, next, id) {
	Article.where('parent').equals(id).populate('user', 'username avatar').exec(function(err, article) {
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

	if (req.user.roles.indexOf('admin') !== -1 || req.article.user._id.toString() === req.user._id.toString()) {
		next();
		return;
	}
	return res.status(403).send({
		message: 'User is not authorized'
	});
};
