'use strict';

//Teams service used for communicating with the teams REST endpoints
angular.module('teams')
	.factory('Teams', //the name of the resource Class
	['$resource',
	function($resource) {
		return $resource('teams/:teamId',
		{
			teamId: '@_id',
		},
		{
			update: {
				method: 'PUT'
			},
			list: {
				method: 'GET',
				isArray: true,
				params: {
					sortBy: '@sortBy' //$scope.sorter
				}
			}
		});
	}
]);