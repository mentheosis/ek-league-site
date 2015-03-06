'use strict';

angular.module('scrim-finder').controller('ScrimController', ['$scope', '$rootScope', 'Authentication', 'Scrims', 'SocketIO', 'Teams',
function($scope, $rootScope, Authentication, Scrims, SocketIO, Teams) {

  // This provides Authentication context.
  $scope.authentication = Authentication;
  $scope.chatMessages = [];

  $scope.createVisible = false;
  $scope.switchCreateVisible = function(){
    $scope.createVisible = !$scope.createVisible;
    $scope.showInstructions = false;
  };

  /*
  function findTeam() {
    if(Authentication.user.team) {
      $scope.team = Teams.get({
				teamId: Authentication.user.team
			});
    }
  }
  //get user team at load
  findTeam();
  */

  $scope.createScrim = function() {
    var image;
    if(!Authentication.user.avatar) {
      image = '/modules/core/img/default-avatar.png'
    }
    else {
      image = Authentication.user.avatar
    }

    var scrim = new Scrims({
      map: this.map,
      format: this.format,
      notes: this.notes,
      imageurl: image,
      team: Authentication.user.username
    });

    scrim.$save(function(response) {
      //$location.path('articles/' + response._id);
      $scope.switchCreateVisible();

      $scope.map = '';
      $scope.format = '';
      $scope.notes = '';
      //the unshift is now handled by sockets!
      //$scope.scrims.unshift(scrim); //push it to the display
      //$scope.createVisible = !$scope.createVisible;
    }, function(errorResponse) {
      $scope.error = errorResponse.data.message;
    });
  };

  $scope.sendChat = function(msg) {
    if(msg !== '')
    {
      SocketIO.emit('scrim-chat', { user: Authentication.user.username, message:msg});
      $scope.chatMsg='';
    }
  };

  $scope.isScrimCreator = function (scrim) {
    return scrim.team === Authentication.user.username
  }

  $scope.canSeePrivateChat = function (scrim) {
    return ((scrim.team === Authentication.user.username && scrim.acceptedUser !== "")
      || scrim.acceptedUser === Authentication.user.username)
  }

  $scope.hasReplies = function (scrim) {

    return $scope.isScrimCreator(scrim) && scrim.replies.length >= 1;
  }

  $scope.replied = function (scrim) {
    return !$scope.isScrimCreator(scrim) && scrim.replies.indexOf(Authentication.user.username) !== -1
  }

  $scope.scrimFinalized = function(scrim) {
    return scrim.acceptedUser && scrim.acceptedUser !== "";
  };

  $scope.replyToScrim = function(scrimId) {
    SocketIO.emit('scrim reply', { scrim: scrimId, user: Authentication.user.username })
  };

  $scope.acceptReply = function(scrimId, acceptedUser) {
    SocketIO.emit('scrim accept', { scrim: scrimId, user: acceptedUser })
  };

  $scope.saveHomeInfo = function (scrim) {
    SocketIO.emit('home info', { 'scrim': scrim._id, 'home': scrim.homeInfo })
  };
  $scope.saveAwayInfo = function (scrim) {
    SocketIO.emit('away info', { 'scrim': scrim._id, 'away': scrim.awayInfo })
  };


  $scope.orderScrims = function(scrim) {
    if($scope.canSeePrivateChat(scrim))
      return 0
    else if($scope.replied(scrim) || $scope.hasReplies(scrim))
      return 1
    else if(scrim.acceptedUser && scrim.acceptedUser !== "")
      return 99
    else
      return 55
  };

  $scope.initialize = function(){
    SocketIO.emit('initialize chat', {user: Authentication.user.username});
    $scope.scrims = Scrims.query();
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
    SocketIO.emit('exiting chat', {user: Authentication.user.username});
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
    $scope.chatMessages = res;
  });

  $scope.userList = []
  var clearUserListener = SocketIO.on('update userlist', function(userlist){
    console.log('got userlist')
    console.log(JSON.stringify(userlist));
    $scope.userList = userlist;
  });


}
]);
