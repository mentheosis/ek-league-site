'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	chalk = require('chalk'),
	scrimController = require('./app/controllers/scrims.server.controller');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */


// Init the express application
var app = require('./config/express')();


// Start the app by listening on <port>
var server = app.listen(config.port);

var socket = require('socket.io').listen(server);
scrimController.setSocket(socket);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN Chat started on port ' + config.port);
