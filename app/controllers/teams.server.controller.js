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
	team.lowername = team.name.toLowerCase();

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

exports.joinOrQuitTeam = function(req, res) {
	if(req.query.newMember) joinTeam(req,res);
	else if(req.query.removeMember) quitTeam(req,res);
	else return res.status(500).send({
		message: 'Improper join or quit request'
	});
};

function joinTeam(req, res) {
	var team = req.team;
	if(req.team.members.indexOf(req.query.newMember) === -1)
	{
		team.members.push(mongoose.Types.ObjectId(req.query.newMember));

		team.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(team);
			}
		});
	}
	else return res.status(500).send({
		message: 'Improper join or quit request'
	});
};

function quitTeam(req, res) {
	var team = req.team;
	var memberIndex = req.team.members.indexOf(req.query.removeMember);
	if(memberIndex !== -1)
	{
		req.team.members.splice(memberIndex, 1);

		team.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(team);
			}
		});
	}
	else return res.status(500).send({
		message: 'Improper join or quit request'
	});
};


/**
 * Delete a team
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
	Team.findById(id).populate('User','username avatar').exec(function(err, team) {
		if (err) return next(err);
		if (!team) return next(new Error('Failed to load teams ' + id));
		req.team = team;
		//console.log(JSON.stringify(team))
		next();
	});
};

/**
 * Team authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.team.founder.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
