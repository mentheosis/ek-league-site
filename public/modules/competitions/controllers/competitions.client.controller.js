'use strict';

angular.module('competitions').controller('CompController', ['$scope', '$stateParams', 'Authentication', 'Competitions',
function($scope, $stateParams, Authentication, Competitions) {
  $scope.authentication = Authentication;

  $scope.createComp = function() {
    var comp = new Competitions({
      name: this.compName,
      banner: this.compBanner,
      description: this.compDesc
    });

    comp.$save(function(response) {
      $scope.compName = '';
      $scope.compBanner = '';
      $scope.compDesc= '';
    }, function(errorResponse) {
      $scope.error = errorResponse.data.message;
    });
  };

  $scope.listComps = function() {
    $scope.competitions = Competitions.query();
  };

  $scope.getComp = function() {
    $scope.comp = Competitions.get({ compId: $stateParams.compId });
  };

}
]);
