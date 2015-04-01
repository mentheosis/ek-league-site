'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Team = mongoose.model('Team'),
	User = mongoose.model('User'),
	_ = require('lodash');



function initializeUsersTeam(){
	Team.find({})
	.exec(function(err, teams) {
		if (err) {
			console.log(err);
			return;
		} else {
			for (var t in teams) {
				for (var m  in teams[t].toObject().members) {
					//console.log(teams[t].toObject().members[m]);
					setUserTeam(teams[t].toObject().members[m], teams[t].toObject()._id)
				}
			}
			return;

		}
	});
}

function setUserTeam (userId, teamId) {
	User.findOne({_id: userId}, '-salt, -password', function(err, user){
		if(err || !user){
			console.log('error')
			console.log(err);
			return;
		}
		//console.log('setting ' + userId + ' to ' + teamId );
		user.team = teamId;
		user.save(function(err){
			if(err) console.log(err);
			//console.log('updated user team');
		});
	});
}

//initialize on server start
initializeUsersTeam();

/**
 * Create a Team
 */
exports.create = function(req, res) {

	if(req.user.team && req.user.team !== '') {
		return res.status(403).send({
			message: 'You are already on a team'
		});
	}

	Team.findOne({founder:req.user._id},'-joinpw').exec(function(err, existingTeam) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else if(existingTeam){
			return res.status(403).send({
				message: 'You have already founded a team'
			});
		}
		else {

				var team = new Team(req.body);

				team.founder = req.user;
				team.members.push(req.user._id);
				team.lowername = team.name.toLowerCase();
				team.joinpw = team.hashPassword(team.joinpw);

				team.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {

						setUserTeam(req.user._id, team._id);

						//don't return joinpw to client
						team.joinpw = undefined;

						res.json(team);
					}
				});

		}
	});

};

/**
 * Show the current team
 */
exports.read = function(req, res) {

	//don't return joinpw to client
	req.team.joinpw = undefined;

	res.json(req.team);
};

/**
 * Update a team
 */
exports.update = function(req, res) {

	var team = req.team;
	//console.log('before ' + JSON.stringify(team));

	if(req.body.joinpw) {
		req.body.joinpw = team.hashPassword(req.body.joinpw);
	}

	team = _.extend(team, req.body);
	//console.log('after ' + JSON.stringify(team));

	if (!team.imageurl || team.imageurl === "") {
		team.imageurl = "/modules/teams/img/team-default.png";
	}

	team.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//don't return joinpw to client
			populateTeamMembers(team,res);
		}
	});
};

exports.joinOrQuitTeam = function(req, res) {
	console.log('user :' + JSON.stringify(req.user));
	if(req.query.newMember) joinTeam(req,res);
	else if(req.query.removeMember) quitTeam(req,res);
	else return res.status(500).send({
		message: 'Improper join or quit request'
	});
};

function joinTeam(req, res) {
	var team = req.team;

	if(req.user.team && req.user.team !== '') {
		return res.status(403).send({
			message: 'You are already a member of a team.'
		});
	}

	if(!team.authenticate(req.body.password))
	{
		return res.status(403).send({
			message: 'Incorrect team password'
		});
	}

	if(req.team.members.indexOf(req.user._id) === -1)
	{
		team.members.push(mongoose.Types.ObjectId(req.user._id));

		team.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				setUserTeam(req.user._id, team._id);
				populateTeamMembers(team,res);
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
					setUserTeam(req.user._id, undefined);
					populateTeamMembers(team,res)
			}
		});
	}
	else return res.status(500).send({
		message: 'Improper join or quit request'
	});
};

function populateTeamMembers(team, res) {
	var opts = { path: 'members', model: 'User', select: 'username avatar' }

  Team.populate(team, opts, function(err){
		if (err || !team) {
			return res.status(500).send({
				message: 'failed to populate team members'
			});
		}
		else {
			team.joinpw = undefined;
			res.json(team);
		}
	});
}

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
			res.status(200).send({
				message: 'team deleted'
			});
		}
	});
};

/**
 * List of Teams
 */
exports.list = function(req, res) {
	var sortBy = req.query.sortBy;

	Team.find({},'-joinpw').sort(sortBy).exec(function(err, teams) {
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

	if(req.query.removeMember || req.query.newMember)
	{
		teamByIdJoinQuit(req, res ,next, id);
	}
	else
	{
		teamByIdPopulated(req, res, next, id);
	}
};

function teamByIdPopulated(req, res, next, id) {
	Team.findById(id).exec(function(err, team) {

		var opts = { path: 'members', model: 'User', select: 'username avatar' }

	  Team.populate(team, opts, function(){
			if (err) return next(err);
			if (!team) return next(new Error('Failed to load team ' + id));

			req.team = team;
			//console.log(JSON.stringify(team))
			next();
		});
	});
};

function teamByIdJoinQuit(req, res, next, id) {
	Team.findById(id).exec(function(err, team) {
			if (err) return next(err);
			if (!team) return next(new Error('Failed to load team ' + id));

			req.team = team;
			//console.log(JSON.stringify(team))
			next();
	});
};


/**
 * Team authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if(!req.team.founder && req.user.roles.indexOf('admin') !== -1) {
		next();
		return;
	}

	if (req.team.founder.toString() === req.user._id.toString() || req.user.roles.indexOf('admin') !== -1) {
		next();
		return;
	}

	if(req.team.captains.indexOf(req.user.username) !== -1){
		next();
		return;
	}


	return res.status(403).send({
		message: 'User is not authorized'
	});
};
