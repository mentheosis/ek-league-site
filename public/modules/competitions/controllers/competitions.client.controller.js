'use strict';

angular.module('competitions').controller('CompController', ['$scope', '$stateParams', 'Authentication', 'Users', 'Competitions', 'Rankings', 'Teams', 'Matchups', 'Settings',
function($scope, $stateParams, Authentication, Users, Competitions, Rankings, Teams, Matchups, Settings) {
  $scope.authentication = Authentication;

  $scope.hideJoinButton = false;
  $scope.setHideJoinButton = function() {
    if(Authentication.user) {
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


  $scope.showReportButton = false;
  $scope.setShowReportButton = function() {
    if(Authentication.user) {
      var userFromDb = Users.get({userId:Authentication.user._id}, function() {
        if(userFromDb._id === userFromDb.team.founder || userFromDb.team.captains.indexOf(userFromDb.username) !== -1) {

          for(var r in $scope.rankings) {
            if($scope.rankings[r].team && $scope.rankings[r].team._id === userFromDb.team._id) {
              $scope.showReportButton = true;
            }
          }

        }
      });
    }
  }

  $scope.reportText = 'Reporting...'
	$scope.tryReportWin = function(){
    $scope.showReportModal = true;
		var userFromDb = Users.get({userId:Authentication.user._id}, function() {
			if(userFromDb.team) {
        if(userFromDb._id === userFromDb.team.founder || userFromDb.team.captains.indexOf(userFromDb.username) !== -1) {

          for(var m in $scope.matchups) {
            var match = $scope.matchups[m];
            if((match.home && match.away) && (match.home._id === userFromDb.team._id || match.away._id === userFromDb.team._id)) {

              var delayText = '';

              if(match.winner){
                if(match.winner === userFromDb.team._id){
                  delayText = 'Your team has already reported.'
                }
                else {
                  delayText = 'The other team reported a win too. Please contact an admin.'
                  match.disputed = true;
                }
              }
              else {
                delayText = 'Congratulations on your win!'
                match.winner = userFromDb.team._id;
                if(match.home._id === userFromDb.team._id){
                  match.loser = match.away._id;
                }
                else {
                  match.loser = match.home._id;
                }
              }

              match.$update({matchupId:match._id}, function(){
                $scope.reportText = delayText;
                $scope.listMatchups();
              });
              return;
            }
          }

        }
  			else {
          $scope.joinText = 'You must be a team captain to report a win.'
        }
      }
			else {
        $scope.joinText = 'You must be on a team to report a win.'
      }
		});
	}

  $scope.setWinner = function(match){
    if(match.home._id === match.winner){
      match.loser = match.away._id;
    }
    else if(match.away._id === match.winner){
      match.loser = match.home._id;
    }
    match.disputed=false;
    match.$update({matchupId:match._id},function(){
      if($scope.selectedComp)
        $scope.gatherCompData($scope.selectedComp)
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
    $scope.comp = Competitions.get({ compId: $scope.selectedComp }, function(success){
      $scope.roundChoices = [];
      for(var i = 1; i <= $scope.comp.maps.length; i++) {
        $scope.roundChoices.push(i);
      }
    });
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
          $scope.gatherCompData($scope.selectedComp)
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
      $scope.setShowReportButton();
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
    team.$remove({rankingId: team._id},function(success){
        $scope.sucess = 'Team Removed';
        $scope.listRankings();
      },function(error) {
        $scope.error = error.data.message;
      })
    $scope.confirmRemoveTeam = false;
  }

  $scope.listMatchups = function() {
    $scope.matchups = Matchups.query({compId: $scope.selectedComp});
  }

  $scope.addMatchup = function() {
    var matchup = new Matchups({
      competition: $scope.comp._id,
      week: $scope.comp.currentWeek,
      home: $scope.newHome._id,
      away: $scope.newAway._id
    });
    matchup.$save({}, function(){
      $scope.listMatchups();
    })
  }

  $scope.deleteMatchup = function(matchup, index) {
    matchup.$remove();
    $scope.matchups.splice(index, 1);
  }

  $scope.calculateWinLoss = function() {

    var matchupHistory = Matchups.query({compId:$scope.comp._id, allHistory:true}, function(history){

        var winMap = {};
        var lossMap = {};

        for(var m in matchupHistory) {

          if(!matchupHistory[m].winner){
            continue;
          }

          var winner = matchupHistory[m].winner;
          if(winMap[winner]) { winMap[winner] = winMap[winner] + 1; }
          else{ winMap[winner] = 1 }

          var loser = matchupHistory[m].loser;
          if(lossMap[loser]) { lossMap[loser] = lossMap[loser] + 1; }
          else{ lossMap[loser] = 1 }
        }

        for(var r in $scope.rankings) {
          if(!$scope.rankings[r].team)
            break;
          $scope.rankings[r].wins = winMap[$scope.rankings[r].team._id] || 0
          $scope.rankings[r].losses = lossMap[$scope.rankings[r].team._id] || 0

          $scope.rankings[r].$update({rankingId:  $scope.rankings[r]._id });
        }

    })
  }

  $scope.generateMatchups = function() {
      var matchup = new Matchups({ });

      if(!$scope.comp) { return $scope.error = 'Select a Competition First' }

      matchup.$generate({compId: $scope.comp._id}, function(){
        $scope.listMatchups();
      }, function(err){
        $scope.error = err;
      });

      $scope.confirmGenerate = false

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
