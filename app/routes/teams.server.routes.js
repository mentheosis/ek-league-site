'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller');
var teams = require('../../app/controllers/teams.server.controller');

module.exports = function(app) {
	// Team Routes
	app.route('/teams')
		.get(teams.list)
		.post(users.requiresLogin, teams.create);

	app.route('/teams/:teamId')
		.get(teams.read)
		.put(users.requiresLogin, teams.hasAuthorization, teams.update)
		.post(users.requiresLogin, teams.joinOrQuitTeam)
		.delete(users.requiresLogin, teams.hasAuthorization, teams.delete);

	// Finish by binding the team middleware
	app.param('teamId', teams.teamByID);
};
