'use strict';

angular.module('competitions')
  .factory('Matchups', //the name of the resource Class
  ['$resource',
  function($resource) {
    return $resource('matchups/:compId',
    {
      matchupId: '@_id',
    },
    {
      generate: {
        method: 'POST',
        //isArray: true,
        //params: { sortBy: '@sortBy', },
      },
      list: {
        method: 'GET',
        isArray: true,
        //params: { }
      }
    });
  }
]);
