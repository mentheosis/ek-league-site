'use strict';

angular.module('competitions').controller('CompController', ['$scope', '$stateParams', 'Authentication', 'Users', 'Competitions', 'Rankings', 'Teams', 'Matchups', 'Settings',
function($scope, $stateParams, Authentication, Users, Competitions, Rankings, Teams, Matchups, Settings) {
  $scope.authentication = Authentication;

  $scope.hideJoinButton = false;
  $scope.setHideJoinButton = function() {
    for(var r in $scope.rankings) {
      if($scope.rankings[r].team && $scope.rankings[r].team._id === Authentication.user.team){
        $scope.hideJoinButton = true;
      }
      //TODO check user team from db
      //if($scope.rankings[r].team === Authentication.user.team){
      //  $scope.hideJoinButton = true;
      //}
    }
  }



  $scope.joinText = 'Joining competition...'
	$scope.tryJoinCompetition = function(){
    $scope.showJoinModal = true;
		var userFromDb = Users.get({userId:Authentication.user._id}, function() {
			if(userFromDb.team) {
        if(userFromDb._id === userFromDb.team.founder || userFromDb.team.captains.indexOf(userFromDb.username) !== -1) {
          if(userFromDb.team.members.length < 5){
            $scope.joinText = 'You must have at least 5 members on your roster to register.'
          }
          else {
            $scope.joinText = userFromDb.team.name + ' registered!'
            $scope.addTeamToComp(userFromDb.team._id, $scope.selectedComp);
          }
        }
  			else {
          $scope.joinText = 'You must be a captain to register your team.'
        }
      }
			else {
        $scope.joinText = 'You must be a team captain to join this competiton.'
      }
		});
	}

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
    $scope.listRules();
  };

  $scope.getComp = function() {
    $scope.comp = Competitions.get({ compId: $scope.selectedComp });
  };

  $scope.saveComp = function() {
    if($scope.comp)
    {
      if($scope.compRules)
        $scope.comp.rules = $scope.compRules._id
      if($scope.compSettings)
        $scope.comp.settings = $scope.compSettings._id
      $scope.comp.$save({},function(){
        $scope.listComps();
        if($scope.selectedComp)
          $scope.getComp()
      });
    }
  };

  $scope.listTeams = function() {
    //$scope.teams = Teams.query();
    $scope.teams = Teams.list({sortBy:'lowername'});
  };

  $scope.listRankings = function() {
    $scope.rankings = Rankings.list({compId: $scope.selectedComp, sortBy:'wins'}, function(){
          $scope.setHideJoinButton();
    })
  };

  $scope.addTeamToComp = function(teamId, compId) {
    if(teamId && compId)
    {
      var team = new Rankings({
        competition: compId,
        team: teamId,
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

  $scope.listRules = function() {
    $scope.ruleSets = Settings.query({category:'rules'});
  }

  $scope.selectRules = function(id) {
    var ruleId;
    if(id) ruleId = id;
    else ruleId = $stateParams.ruleId;
    $scope.selectedRules = Settings.get({settingId: ruleId});

    $scope.selectedRules.$promise.then(function(rules){

      console.log('rules: ', rules)

      if($scope.selectedRules.value[0] && !$scope.selectedRules.value[0].text) {
        var newValue = [];
        for(var i=0; i < $scope.selectedRules.value.length; i++) {
            var item = $scope.selectedRules.value[i];
            var newItem = {};
            newItem.title = item.substring(0,item.indexOf('-')).trim();
            newItem.text = item.substring(item.indexOf('-')+1,item.length).trim();
            newValue.push(newItem);
        }
        $scope.selectedRules.value = newValue;
        $scope.selectedRules.$update();
      }
    })
  }

  $scope.saveRuleSet = function() {
    $scope.selectedRules.$update();
  }

	$scope.deleteRuleset = function() {
		$scope.selectedRules.$remove();
    $scope.selectedRules = undefined;
    $scope.confirmDelete = false;
    $scope.selectRules();
	}

	$scope.saveNewRuleSet = function() {
		$scope.resText = '';

		var newsetting = new Settings({
			category: 'rules',
			name: this.ruleSetName,
			value: []
		});

		newsetting.$save(function(res){
			$scope.ruleSetName = '';
			$scope.ruleSets.push(res);
			$scope.resText = 'Saved';
		});
	}


}
]);
