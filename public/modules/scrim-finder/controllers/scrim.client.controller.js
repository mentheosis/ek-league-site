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
    SocketIO.emit('initialize chat');
    $scope.scrims = Scrims.query();
  };

  /*
    if you leave the scrim page and return, the scrim controller
    is destroyed and recreated, but the original event listener
    for chat messages still exists, so now you've got two. They
    keep multiplying as you leave and return to the scrim page.
    This rootScope bit is a hacky solution to call the removeListener
    if this is not the first time coming to the scrim page.
  */
  if($rootScope.clearScrimChatListener)
  {
    $rootScope.clearScrimChatListener();
  }
  $rootScope.clearScrimChatListener = SocketIO.on('chat message', function(msg){
    //console.log('chat message:  ' + JSON.stringify(msg));
    $scope.chatMessages.push(msg);
  });

  SocketIO.on('initialize chat', function(res){
    $scope.chatMessages = res;
  });

}
]);
