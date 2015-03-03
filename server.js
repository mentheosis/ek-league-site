'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	scrimController = require('./app/controllers/scrims.server.controller');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
var server = app.listen(config.port);

var socket = require('socket.io').listen(server);

socket.on('connection', function(socketconn){
	console.log('a user connected ' + socketconn.id);
	socketconn.on('disconnect', function(){
		console.log('user disconnected');
	});
	socketconn.on('scrim-chat', function(msg){
		scrimController.messageReceived(socket, msg);
	});
	socketconn.on('initialize chat', function(req){
		scrimController.InitializeMessageDisplay(socket, socketconn, req);
	});
	socketconn.on('exiting chat', function(req){
		scrimController.ExitChat(socket, socketconn, req);
	});
});

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('EK League server started on port ' + config.port);
