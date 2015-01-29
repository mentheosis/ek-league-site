'use strict';

// Setting up route
angular.module('teams').config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider.
  state('teams', {
    url: '/teams',
    templateUrl: 'modules/teams/views/teams.client.view.html'
  });

}
]);
