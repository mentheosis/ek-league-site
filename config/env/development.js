'use strict';

module.exports = {
	//db: 'mongodb://192.168.1.4/ekleague',
	db: 'localhost/ekleague',
	port: process.env.PORT || 3000,
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'dev',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			//stream: 'access.log'
		}
	},
	app: {
		title: 'eKombat - Development Environment'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'noreply@stdio.io' || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail' || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'stdio.io.bot@gmail.com' || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || "Don'tCh4seTheH4re" || 'MAILER_PASSWORD'
			}
		}
	}
};
