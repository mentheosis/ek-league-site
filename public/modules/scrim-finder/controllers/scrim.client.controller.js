'use strict';

angular.module('scrim-finder').controller('ScrimController', ['$scope', 'Authentication', 'Scrims', 'SocketIO',
function($scope, Authentication, Scrims, SocketIO) {

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

  SocketIO.on('chat message', function(msg){
    $scope.chatMessages.push(msg);
  });

  SocketIO.on('initialize chat', function(res){
    $scope.chatMessages = res;
  });

}
]);
