'use strict';

angular.module('competitions')
  .factory('Rankings', //the name of the resource Class
  ['$resource',
  function($resource) {
    return $resource('rankings/:compId',
    {
      rankId: '@_id',
    },
    {
      list: {
        method: 'GET',
        isArray: true,
        params: {
          sortBy: '@sortBy'
        }
      }
    });
  }
]);
