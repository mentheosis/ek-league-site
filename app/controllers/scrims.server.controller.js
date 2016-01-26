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
      addUser(req.user, socketconn.id);
    });
    socketconn.on('exiting chat', function(req){
      removeUser(req.user);
    });

  });

}


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

var lastMessageStamp = moment().format();
var messageReceived = function(msg){
  socketIo.emit('chat message', msg);
};
