
var users = require('../../app/controllers/users.server.controller');
var scrim = require('../../app/controllers/scrims.server.controller');

module.exports = function(app) {
  app.route('/scrims')
    .get(scrim.list)
    .post(users.requiresLogin, scrim.create);

	app.route('/scrims/:scrimId')
		.delete(users.requiresLogin, scrim.delete);

	// Finish by binding the team middleware
	app.param('scrimId', scrim.scrimById);

};
