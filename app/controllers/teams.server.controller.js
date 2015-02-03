'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Team = mongoose.model('Team'),
	_ = require('lodash');

/**
 * Create a Team
 */
exports.create = function(req, res) {
	var team = new Team(req.body);

	team.user = req.user;

	team.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(team);
		}
	});
};

/**
 * Show the current team
 */
exports.read = function(req, res) {
	res.json(req.team);
};

/**
 * Update a team
 */
exports.update = function(req, res) {
	var team = req.team;

	//console.log('resetting parent');
	//team.parent = '';//team.id;

	team = _.extend(team, req.body);

	team.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(team);
		}
	});
};


/**
 * Delete an team
 */
exports.delete = function(req, res) {
	var team = req.team;

	team.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(team);
		}
	});
};

/**
 * List of Teams
 */
exports.list = function(req, res) {
	var sortBy = req.query.sortBy;

	Team.find({}).sort(sortBy).populate('user', 'username').exec(function(err, teams) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(teams);
		}
	});
};

/**
 * Team middleware
 */
exports.teamByID = function(req, res, next, id) {
	Team.findById(id).populate('user', 'username').exec(function(err, teams) {
		if (err) return next(err);
		if (!teams) return next(new Error('Failed to load teams ' + id));
		req.teams = teams;
		next();
	});
};

/**
 * Team authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.team.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
