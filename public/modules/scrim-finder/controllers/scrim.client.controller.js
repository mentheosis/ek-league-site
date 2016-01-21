'use strict';

angular.module('scrim-finder').controller('ScrimController', ['$scope', '$rootScope', 'SocketIO',
function($scope, $rootScope, SocketIO) {

  $scope.chatMessages = [];

  $scope.sendChat = function(msg) {
    if(msg !== '')
    {
      SocketIO.emit('scrim-chat', { user: Authentication.user.username, message:msg});
      $scope.chatMsg='';
    }
  };

  /*
    if you leave the scrim page and return, the scrim controller
    is destroyed and recreated, but the original event listener
    for chat messages still exists, so now you've got two. They
    keep multiplying as you leave and return to the scrim page.

    Must cleanup listeners when the scope is destroyed! */
  $scope.$on('$destroy', function() {
    if(clearChatListener) { clearChatListener(); }
    if(clearInitlistener) { clearInitlistener(); }
    if(clearUserListener) { clearUserListener(); }
    if(clearAddListener) { clearAddListener(); }
    if(clearUpdateListener) { clearUpdateListener(); }
    if(clearDeleteListener) { clearDeleteListener(); }
    SocketIO.emit('exiting chat', {user: Authentication.user.username});
  });

  var clearDeleteListener = SocketIO.on('scrim deleted', function(req){
    for (var s = 0; s < $scope.scrims.length; s++ ){
      if ($scope.scrims[s]._id === req.scrim) {
        $scope.scrims.splice(s,1);
        return;
      }
    }
  });

  var clearHomeInfoListener = SocketIO.on('home info updated', function(req){
    for (var s = 0; s < $scope.scrims.length; s++ ){
      if ($scope.scrims[s]._id === req.scrim) {
        $scope.scrims[s].homeInfo = req.home;
        return;
      }
    }
  });

  var clearAwayInfoListener = SocketIO.on('away info updated', function(req){
    for (var s = 0; s < $scope.scrims.length; s++ ){
      if ($scope.scrims[s]._id === req.scrim) {
        $scope.scrims[s].awayInfo = req.away;
        return;
      }
    }
  });

  var clearUpdateListener = SocketIO.on('scrim updated', function(scrim){
    for (var s = 0; s < $scope.scrims.length; s++ ){
      if ($scope.scrims[s]._id === scrim._id) {
        $scope.scrims.splice(s, 1, scrim);
        return;
      }
    }
  });

  var clearAddListener = SocketIO.on('scrim added', function(scrim){
    $scope.scrims.unshift(scrim);
  });

  var clearChatListener = SocketIO.on('chat message', function(msg){
    $scope.chatMessages.push(msg);
  });

  var clearInitlistener = SocketIO.on('initialize chat', function(res){
    $scope.chatMessages = res.messages;
    $scope.chatMessages.push({user:'', message:'last message sent ' + res.lastTimestamp});
  });

  $scope.userList = []
  var clearUserListener = SocketIO.on('update userlist', function(userlist){
    console.log('got userlist')
    console.log(JSON.stringify(userlist));
    $scope.userList = userlist;
  });


}
]);
