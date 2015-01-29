'use strict';

angular.module('scrim-finder').controller('ScrimController', ['$scope', '$rootScope', 'Authentication', 'Scrims', 'SocketIO',
function($scope, $rootScope, Authentication, Scrims, SocketIO) {

  // This provides Authentication context.
  $scope.authentication = Authentication;
  $scope.chatMessages = [];

  $scope.createVisible = false;
  $scope.switchCreateVisible = function(){
    $scope.createVisible = !$scope.createVisible;
  };

  $scope.createScrim = function() {
    var scrim = new Scrims({
      team: this.team,
      map: this.map,
      format: this.format,
      notes: this.notes,
      imageurl: Authentication.user.avatar
    });

    scrim.$save(function(response) {
      //$location.path('articles/' + response._id);
      $scope.switchCreateVisible();

      $scope.team = '';
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
      //$scope.chatMessages.push(msg);
      $scope.chatMsg='';
    }
  };

  $scope.initialize = function(){
    console.log('initializing..');
    console.log('scope: ' + $scope.$id)
    SocketIO.emit('initialize chat');
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
    console.log('destroying scope '+$scope.$id);
  });

  var clearScrimChatListener = SocketIO.on('chat message', function(msg){
    $scope.chatMessages.push(msg);
    //console.log('chat message:  ' + JSON.stringify(msg));
    //console.log('check: ' + JSON.stringify($scope.chatMessages));
    //console.log('scope: ' + $scope.$id);
  });

  var clearInitlistener = SocketIO.on('initialize chat', function(res){
    //console.log('init chat');
    $scope.chatMessages = res;
  });

}
]);
