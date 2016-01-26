'use strict';

angular.module('scrim-finder').controller('ScrimController', ['$scope', '$rootScope', 'SocketIO',
function($scope, $rootScope, SocketIO) {

  $scope.chatMessages = [];
  $scope.username="default"

  $scope.sendChat = function(msg) {
    if(msg !== '')
    {
      SocketIO.emit('scrim-chat', { user: $scope.username, message:msg});
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
    SocketIO.emit('exiting chat', {user: Authentication.user.username});
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
