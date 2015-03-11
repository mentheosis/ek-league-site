'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller'),
		auth = require('../../app/controllers/users/users.authorization.server.controller');

	app.route('/').get(core.index);

	app.route('/settings')
		.get(core.getSettings)
		.post(auth.hasAuthorization(['admin']),core.saveSetting)
		.put(auth.hasAuthorization(['admin']),core.changeSetting);

	app.route('/settings/:settingId')
		.put(auth.hasAuthorization(['admin']),core.updateSetting)
		.delete(auth.hasAuthorization(['admin']),core.deleteSetting);

	app.param('settingId', core.settingByID);

};
