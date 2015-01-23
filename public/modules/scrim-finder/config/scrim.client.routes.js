'use strict';

// Setting up route
angular.module('scrim-finder').config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider.
  state('scrim', {
    url: '/scrim',
    templateUrl: 'modules/scrim-finder/views/scrim.client.view.html'
  });

}
]);
