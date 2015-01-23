'use strict';

//Comments service used for communicating with the articles REST endpoints
angular.module('scrim-finder')
.factory('Scrims', //the name of the resource Class
['$resource',
function($resource) {
  return $resource('scrims/:postId',
{
  postId: '@_id',
});
}
]);
