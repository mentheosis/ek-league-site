'use strict';

var mongoose = require('mongoose'),
errorHandler = require('./errors.server.controller'),
test = require('../models/scrim.server.model.js'),
Scrim = mongoose.model('Scrim');

var MessageQueue = [];

var PushMessage = function(msg){
  if (MessageQueue.length > 25)
  {
    MessageQueue.shift();
  }
  MessageQueue.push(msg);
};

exports.create = function(req,res){
  var scrim = new Scrim(req.body);
  scrim.user = req.user;

  scrim.save(function(err){
    if(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(scrim);
    }
  });
};

exports.list = function(req, res){
  Scrim.find().sort('-created').exec(function(err, scrims) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(scrims);
    }
  });
};

exports.InitializeMessageDisplay = function(socket, conn, req){
  conn.emit('initialize chat', MessageQueue);
};

exports.messageReceived = function(socket, msg){
  PushMessage(msg);
  socket.emit('chat message', msg);
};
