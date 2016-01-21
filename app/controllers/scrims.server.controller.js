'use strict';

var moment = require('moment'),
errorHandler = require('./errors.server.controller');

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
