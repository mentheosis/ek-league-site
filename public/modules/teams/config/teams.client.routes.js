'use strict';

// Setting up route
angular.module('teams').config(['$stateProvider',
	function($stateProvider) {

		// Teams state routing
		$stateProvider.
		state('listTeams', {
			url: '/teams',
			templateUrl: 'modules/teams/views/grid-teams.client.view.html'
		});

		$stateProvider.
		state('createTeam', {
			url: '/teams/create',
			templateUrl: 'modules/teams/views/create-team.client.view.html'
		});

		$stateProvider.
		state('viewTeam', {
			url: '/teams/:teamId',
			templateUrl: 'modules/teams/views/team-bio.client.view.html'
		});

		$stateProvider.
		state('editTeam', {
			url: '/teams/:teamId/edit',
			templateUrl: 'modules/teams/views/edit-team.client.view.html'
		});
	}
]);
