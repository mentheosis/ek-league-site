angular.module('scrim-finder')
  .factory('SocketIO', ['$rootScope', function ($rootScope) {
  var socket = io(); //references script file loaded in layout html.

  return{

    on: function (eventName, callback) {

      socket.on(eventName, wrapper);

      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }

  };
}]);
