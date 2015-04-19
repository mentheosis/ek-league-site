'use strict';

angular.module('competitions')
  .factory('Matchups', //the name of the resource Class
  ['$resource',
  function($resource) {
    return $resource('matchups/:matchupId',
    {
      matchupId: '@_id',
    },
    {
      generate: {
        method: 'POST',
        //isArray: true,
        params: { compId: '@compId' },
      },
      update: {
        method: 'PUT',
        params: {matchupId: '@matchupId'}
      }
    });
  }
]);
