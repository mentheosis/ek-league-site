'use strict';

angular.module('competitions')
  .factory('Competitions', //the name of the resource Class
  ['$resource',
  function($resource) {
    return $resource('competitions/:compId',
    {
      compId: '@_id',
    });
}
]);
