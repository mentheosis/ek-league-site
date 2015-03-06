'use strict';

var mongoose = require('mongoose'),
errorHandler = require('./errors.server.controller'),
test = require('../models/scrim.server.model.js'),
Scrim = mongoose.model('Scrim');

var socketIo;

exports.setSocket = function (socket) {
  socketIo = socket;

  socketIo.on('connection', function(socketconn){
  	console.log('a user connected ' + socketconn.id);
  	socketconn.on('disconnect', function(){
  		console.log('user disconnected');
  	});
  	socketconn.on('scrim-chat', function(msg){
  		messageReceived(msg);
  	});
  	socketconn.on('initialize chat', function(req){
      socketconn.emit('initialize chat', MessageQueue);
      addUser(req.user);
  	});
  	socketconn.on('exiting chat', function(req){
      removeUser(req.user);
  	});
  	socketconn.on('scrim reply', function(req){
  		replyToScrim(req);
  	});
  	socketconn.on('scrim accept', function(req){
  		acceptReply(req);
  	});
  	socketconn.on('scrim message', function(req){
  		saveMessage(req);
  	});


  });

}


exports.create = function(req,res){
  var scrim = new Scrim(req.body);
  scrim.user = req.user;

  scrim.save(function(err){
    if(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      socketIo.emit('scrim added', scrim);
      //res.json(scrim);
      res.status(200).send({
        message: "Scrim created"
      });
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


var MessageQueue = [];

var PushMessage = function(msg){
  if (MessageQueue.length > 25)
  {
    MessageQueue.shift();
  }
  MessageQueue.push(msg);
};


var userList = []

var addUser = function(user) {
  var exists = userList.indexOf(user)
  if(exists === -1) {
    userList.push(user)
    socketIo.emit('update userlist', userList);
  }
}

var removeUser = function(user) {
  var exists = userList.indexOf(user)
  if(exists !== -1) {
    userList.splice(exists,1);
    socketIo.emit('update userlist', userList);
  }
}

var replyToScrim = function (req) {
  console.log('trying to reply to scrim');
  console.log(req);
  Scrim.findById(req.scrim, function(err,scrim){
    if(err || !scrim){
      console.log("couldn't find scrim " + req.scrim)
    }
    if(!scrim.replies)
      scrim.replies = [];
    if(scrim.replies.indexOf(req.user) === -1){
      scrim.replies.push(req.user);

      scrim.save(function(err){
        if(err){
          console.log("couldn't save scrim " + req.scrim)
        }
        else {
          socketIo.emit('scrim updated', scrim);
        }
      });
    }
  });
};

var acceptReply = function (req) {
  console.log('trying to accept reply');
  console.log(req);
  Scrim.findById(req.scrim, function(err,scrim){
    if(err || !scrim){
      console.log("couldn't find scrim " + req.scrim)
    }
    scrim.acceptedUser = req.user
    scrim.acceptMessage = "host server info"

    scrim.save(function(err){
      if(err){
        console.log("couldn't save scrim " + req.scrim)
      }
      else {
        socketIo.emit('scrim updated', scrim);
      }
    });
  });
};

var saveMessage = function (req) {
  console.log('trying to save message');
  Scrim.findById(req.scrim, function(err,scrim){
    if(err || !scrim){
      console.log("couldn't find scrim " + req.scrim)
    }
    scrim.acceptMessage = req.message

    scrim.save(function(err){
      if(err){
        console.log("couldn't save scrim " + req.scrim)
      }
      else {
        socketIo.emit('scrim updated', scrim);
      }
    });
  });
};

var messageReceived = function(msg){
  //console.log("message incoming:" + JSON.stringify(msg));
  PushMessage(msg);
  socketIo.emit('chat message', msg);
};
