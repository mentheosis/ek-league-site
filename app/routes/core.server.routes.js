'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller'),
		auth = require('../../app/controllers/users/users.authorization.server.controller');

	app.route('/').get(core.index);

	app.route('/settings')
		.get(core.getSettings)
		.put(auth.hasAuthorization(['admin']),core.changeSettings);
};
