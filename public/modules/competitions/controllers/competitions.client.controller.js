'use strict';

angular.module('competitions').controller('CompController', ['$scope', '$stateParams', 'Authentication', 'Competitions', 'Rankings', 'Teams', 'Matchups',
function($scope, $stateParams, Authentication, Competitions, Rankings, Teams, Matchups) {
  $scope.authentication = Authentication;

  $scope.createComp = function() {
    var comp = new Competitions({
      name: this.compName,
      bannerurl: this.compBanner,
      description: this.compDesc
    });

    comp.$save(function(response) {
      $scope.compName = '';
      $scope.compBanner = '';
      $scope.compDesc = '';
      $scope.listComps();
    }, function(errorResponse) {
      $scope.error = errorResponse.data.message;
    });
  };

  $scope.gatherCompData = function(compId) {
    $scope.comp = undefined;
    if(compId) $scope.selectedComp = compId;
    else $scope.selectedComp = $stateParams.compId;
    $scope.getComp();
    $scope.listRankings();
    $scope.listMatchups();
  }

  $scope.listComps = function() {
    $scope.competitions = Competitions.query();
    $scope.listTeams();
  };

  $scope.getComp = function() {
    $scope.comp = Competitions.get({ compId: $scope.selectedComp });
  };

  $scope.saveComp = function() {
    if($scope.comp)
    {
      //$scope.comp.maps.push({map: 'a', imageurl: 'b'});
      //console.log("update");
      //$scope.comp.maps.push({map: $scope.mapName, imageurl: $scope.mapImage});
      $scope.comp.$save({},function(){
        $scope.listComps();
      });
    }
  };

  $scope.listTeams = function() {
    //$scope.teams = Teams.query();
    $scope.teams = Teams.list({sortBy:'lowername'});
  };

  $scope.listRankings = function() {
    $scope.rankings = Rankings.list({compId: $scope.selectedComp, sortBy:'wins'})
  };

  $scope.addTeamToComp = function() {
    if(this.selectedComp && this.selectedTeam)
    {
      var team = new Rankings({
        competition: this.selectedComp,
        team: this.selectedTeam._id,
      });

      team.$save(function(response) {
        $scope.success = 'Team Added';
        $scope.listRankings();
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }
  };

  $scope.removeTeam = function(team){
    team.$remove({rankId: team._id},function(success){
        $scope.sucess = 'Team Removed';
        $scope.listRankings();
      },function(error) {
        $scope.error = error.data.message;
      })
  }

  $scope.listMatchups = function() {
    $scope.matchups = Matchups.list({compId: $scope.selectedComp});
  }

  $scope.generateMatchups = function() {
      var matchup = new Matchups({ });

      if(!$scope.comp) { return $scope.error = 'Select a Competition First' }

      matchup.$generate({compId: $scope.comp._id}, function(){
        $scope.listMatchups();
      }, function(err){
        $scope.error = err;
      });

    }

	$scope.delete = function(comp) {
		$scope.confirmDelete = false;
		if (comp) {
			comp.$remove(function(){
  			for (var i in $scope.competitions) {
  				if ($scope.competitions[i]._id === $scope.comp._id) {
  					$scope.competitions.splice(i, 1);
  				}
  			}
        $scope.comp=null;
        $scope.rankings=null;
      });
		}
	};


}
]);
