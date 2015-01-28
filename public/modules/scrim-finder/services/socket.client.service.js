angular.module('scrim-finder')
  .factory('SocketIO', ['$rootScope', function ($rootScope) {
  var socket = io(); //references script file loaded in layout html.

  return{

    on: function (eventName, callback) {
      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        //console.log('clearing listener');
        socket.removeListener(eventName, wrapper);
      };

    },

    clear: function () {

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
