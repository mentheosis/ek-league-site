'use strict';

angular.module('scrim-finder').controller('ScrimController', ['$scope', '$rootScope', 'Authentication', 'Scrims', 'SocketIO', 'Teams',
function($scope, $rootScope, Authentication, Scrims, SocketIO, Teams) {

  // This provides Authentication context.
  $scope.authentication = Authentication;
  $scope.chatMessages = [];

  $scope.createVisible = false;
  $scope.switchCreateVisible = function(){
    $scope.createVisible = !$scope.createVisible;
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
      $scope.scrims.unshift(scrim); //push it to the display
      //$scope.createVisible = !$scope.createVisible;
    }, function(errorResponse) {
      $scope.error = errorResponse.data.message;
    });
  };

  $scope.sendChat = function(msg) {
    if($scope.chatMsg !== '')
    {
      SocketIO.emit('scrim-chat', { user: Authentication.user.username, message:msg});
      $scope.chatMsg='';
    }
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
    if(clearScrimChatListener) {
      clearScrimChatListener();
    }
    if(clearInitlistener) {
      clearInitlistener();
    }
    if(clearUserListener) {
      clearUserListener();
    }
    SocketIO.emit('exiting chat', {user: Authentication.user.username});
  });

  var clearScrimChatListener = SocketIO.on('chat message', function(msg){
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
