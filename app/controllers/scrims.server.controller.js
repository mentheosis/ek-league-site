'use strict';

var mongoose = require('mongoose'),
moment = require('moment'),
errorHandler = require('./errors.server.controller'),
test = require('../models/scrim.server.model.js'),
Scrim = mongoose.model('Scrim');

var socketIo;

exports.setSocket = function (socket) {
  socketIo = socket;

  socketIo.on('connection', function(socketconn){
  	console.log('a user connected ' + socketconn.id);
  	socketconn.on('disconnect', function(){
  		console.log('user disconnected ' + socketconn.id);
      removeUserBySocketId(socketconn.id)
  	});
  	socketconn.on('scrim-chat', function(msg){
  		messageReceived(msg);
  	});
  	socketconn.on('initialize chat', function(req){
      socketconn.emit('initialize chat', {messages: MessageQueue, lastTimestamp: moment(lastMessageStamp).fromNow()} );
      addUser(req.user, socketconn.id);
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
  	socketconn.on('home info', function(req){
  		saveMessage(req);
      socketconn.broadcast.emit('home info updated', req);
  	});
  	socketconn.on('away info', function(req){
  		saveMessage(req);
      socketconn.broadcast.emit('away info updated', req);
  	});
  	socketconn.on('delete scrim', function(req){
  		deleteScrim(req);
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

exports.delete = function(req, res) {
	var scrim = req.scrim;

	scrim.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.status(200).send({
				message: 'scrim deleted'
			});
		}
	});
};


exports.list = function(req, res){
  var yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 12);
  Scrim.find({"created": {"$gte": yesterday}}).sort('-created').exec(function(err, scrims) {
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
var userMap = []

var addUser = function(user, socketId) {
  var exists = userList.indexOf(user)
  if(exists === -1) {
    userList.push(user)
    socketIo.emit('update userlist', userList);
  }

  for (var i=0; i<userMap.length; i++) {
    if(userMap[i].socketId === socketId) {
      userMap[i].username = user;
      return
    }
  }
  userMap.push({'socketId':socketId, 'username':user})
}

var removeUser = function(user) {
  var exists = userList.indexOf(user)
  if(exists !== -1) {
    userList.splice(exists,1);
    socketIo.emit('update userlist', userList);
  }
}

var removeUserBySocketId = function(socketId) {
  var userToRemove;
  for (var i=0; i<userMap.length; i++) {
    if(userMap[i].socketId === socketId) {
      userToRemove = userMap[i].username;
      userMap.splice(i,1);
      break;
    }
  }
  removeUser(userToRemove);
}


var deleteScrim = function (req, socketconn) {
  Scrim.findById(req.scrim, function(err,scrim){
    if(err || !scrim){
      console.log("couldn't find scrim " + req.scrim)
    }

    scrim.remove(function(err){
      if(err){
        console.log("couldn't delete scrim " + req.scrim)
      }
      else {
        socketIo.emit('scrim deleted', req);
      }
    });
  });
};


var replyToScrim = function (req) {
  Scrim.findById(req.scrim, function(err,scrim){
    if(err || !scrim){
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
  Scrim.findById(req.scrim, function(err,scrim){
    if(err || !scrim){
      console.log("couldn't find scrim " + req.scrim)
    }

    if(req.home) {
      scrim.homeInfo = req.home;
    }
    if(req.away) {
      scrim.awayInfo = req.away;
    }

    scrim.save(function(err){
      if(err){
        console.log("couldn't save scrim " + req.scrim)
      }
      else {
        //emitting to all caused some kind of ng-change feedback loop, so taking different approach above.
        //socketIo.emit('scrim updated', scrim);
        console.log('message saved')
      }
    });
  });
};

var lastMessageStamp = moment().format();
var messageReceived = function(msg){
  lastMessageStamp = moment().format();
  PushMessage(msg);
  socketIo.emit('chat message', msg);
};

exports.scrimById = function(req, res, next, id) {
  Scrim.findById(id)
  .exec(function(err, scrim) {
    if (err) return next(err);
    if (!scrim) return next(new Error('Failed to find scrim with id ' + id));
    req.scrim = scrim;
    next();
  })
};
