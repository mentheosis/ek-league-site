'use strict';

//Comments service used for communicating with the articles REST endpoints
angular.module('core')
.factory('Settings', //the name of the resource Class
['$resource',
function($resource) {
  return $resource('settings/:settingId',
  {
    settingId: '@_id',
  },
  {
    update: {
      method: 'PUT',
      params: {
        settingName: '@settingName',
        settingValue: '@settingValue'
      }
    }
  }
  );}
]);
