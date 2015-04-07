'use strict';

// Setting up route
angular.module('competitions').config(['$stateProvider',
function($stateProvider) {

  $stateProvider.
  state('competitions', {
    url: '/competitions',
    templateUrl: 'modules/competitions/views/competitions.client.view.html'
  });

  $stateProvider.
  state('manage-comps', {
    url: '/manage-comps',
    templateUrl: 'modules/competitions/views/manage-comps.client.view.html'
  });

  $stateProvider.
  state('manage-rules', {
    url: '/manage-rules',
    templateUrl: 'modules/competitions/views/manage-rules.client.view.html'
  });

  $stateProvider.
  state('rules', {
    url: '/rules/:ruleId',
    templateUrl: 'modules/competitions/views/rules.client.view.html'
  });

  $stateProvider.
  state('comp-detail', {
    url: '/competitions/:compId',
    templateUrl: 'modules/competitions/views/comp-detail.client.view.html'
  });

}
]);
