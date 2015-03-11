'use strict';

Array.prototype.indexOfUsername = function(username) {
    for (var i = 0; i < this.length; i++)
        if (this[i].username === username)
            return i;
    return -1;
}

angular.module('teams').controller('TeamsController', ['$scope', '$rootScope', '$stateParams', '$location', '$animate', '$timeout', 'Authentication', 'Settings', 'Teams',
	function($scope, $rootScope, $stateParams, $location, $animate, $timeout, Authentication, Settings, Teams) {
		$scope.authentication = Authentication;
		//if(authentication.user.color)
		//	$scope.userSelectedColor = authentication.user.color;

		$scope.indexOfUsername = function(id){
			return this.indexOfUsername(id);
		}

    $scope.canEditStuff = function() {
      return (
        $scope.team &&
        Authentication.user &&
        (
          Authentication.user._id === $scope.team.founder
          || $rootScope.adminMode
          || ($scope.team.captains && $scope.team.captains.indexOf(Authentication.user.username) !== -1)
        ));
    };

    $scope.saveTeamImg = function() {
      $scope.team.$update(function(res){
        $scope.showEditImage = false;
      });
    };

    $scope.teamProfileItems = [];
		$scope.getTeamProfileItems = function() {
			Settings.get({settingName:'teamProfile'},
				function(response){
          if(response && response.value)
					  $scope.teamProfileItems = response.value;
            buildTeamProfileAnswers();
				}
			);
		}

		$scope.saveTeamProfileItems = function(){
			if($scope.teamProfileItems)
			{
        console.log("saving: " + $scope.teamProfileItems)
				Settings.update({settingName:'teamProfile', settingValue:$scope.teamProfileItems});
			}
		};

    var buildTeamProfileAnswers = function() {
      console.log('building answers');
      var teamProfileAnswers = [];
      for(var i=0; i<$scope.teamProfileItems.length; i++) {
        teamProfileAnswers.push({key: $scope.teamProfileItems[i], answer: ''});
        if($scope.team && $scope.team.profileAnswers) {
          var teamAnswer;
          for(var j=0; j<$scope.team.profileAnswers.length; j++) {
            //console.log('profile answers');
            //console.log($scope.team.profileAnswers[j])
            //console.log($scope.teamProfileItems[i])

            if($scope.team.profileAnswers[j].key === $scope.teamProfileItems[i])
              teamProfileAnswers[i].answer = $scope.team.profileAnswers[j].answer;
          }
        }
      }
      $scope.teamProfileAnswers = teamProfileAnswers;
    };

    $scope.saveTeamProfileAnswers = function(innerScope) {
      $scope.team.profileAnswers = $scope.teamProfileAnswers;
      $scope.team.$update();
      innerScope.editingAnswers = false;
    };

		$scope.joinpassword='';
		$scope.joinTeam = function() {
			$scope.errText = '';
			if(Authentication.user && $scope.team && $scope.team.members.indexOfUsername(Authentication.user.username) === -1)
			{
				$scope.team.password = $scope.joinpassword;
				//$scope.team.members.push(Authentication.user._id);
				$scope.team.$save({newMember: Authentication.user._id},
					function(team){
						$scope.team = team;
						$scope.tryJoinTeam=false;
						$scope.joinpassword='';
					},
					function(err){
						$scope.errText = err.data.message;
						$scope.joinpassword='';

					});
			}
		};

		$scope.quitTeam = function() {
			if(Authentication.user && $scope.team && $scope.team.members.indexOfUsername(Authentication.user.username) !== -1)
			{
        $scope.demote(Authentication.user.username);
				$scope.team.$save({removeMember: Authentication.user._id},
					function(team){
						$scope.team = team;
					});
			}
		};

		$scope.kickMember = function(member) {
      $scope.demote(member.username);
  		$scope.team.$save({removeMember: member._id},
  			function(team){
  				$scope.team = team;
        });
		};

		$scope.editBio = false;
		$scope.processBio = function(){
			if($scope.editBio) {
				$scope.team.$update();
			}
			$scope.editBio = !$scope.editBio;
		};

		$scope.create = function() {
			var team = new Teams({
				name: this.name,
			});

			team.imageurl = this.imageurl;
			team.joinpw = this.joinpw;

			team.$save(function(response) {
				//$location.path('teams/' + response._id);
				$location.path('teams/' + response._id);
				$scope.name = '';
				$scope.description = '';
				$scope.imageurl= '';
				$scope.teams.unshift(team); //push it to the display
				$scope.hideCreateForm();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

    $scope.updatePassword = function() {
      $scope.team.joinpw = $scope.joinpassword;
      $scope.team.$update(function(){
        $scope.changingPassword = false;
      }, function(err){
        $scope.error = err.data.message;
      });
    }

		$scope.delete = function(team) {
			$scope.confirmDelete = false;
			if (team) {
				team.$remove();

				for (var i in $scope.teams) {
					if ($scope.teams[i] === team) {
						$scope.teams.splice(i, 1);
					}
				}
			} else {
				$scope.team.$remove(function() {
					$location.path('teams');
				});
			}
		};

    $scope.promote = function(username) {
      if($scope.team.captains.indexOf(username) === -1) {
        $scope.team.captains.push(username);
        $scope.team.$update();
      }
    }

    $scope.demote = function(username) {
      var index = $scope.team.captains.indexOf(username);
      if(index !== -1) {
        $scope.team.captains.splice(index,1);
        $scope.team.$update();
      }
    }

    $scope.isCaptain = function(username) {
      if($scope.team.captains.indexOf(username) !== -1)
        return true;
      return false;
    }

		$scope.update = function() {
			var team = $scope.team;

			team.$update(function() {
				$location.path('teams/' + team._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.sortBy = "created";
		$scope.sortDesc = true;
		$scope.find = function() {
			//$scope.teams = Teams.query();
			$scope.teams = Teams.list({sortBy:($scope.sortDesc?'-':'') + $scope.sortBy});
		};

		$scope.findOne = function() {
			$scope.team = Teams.get({teamId: $stateParams.teamId}, function(res){
        $scope.getTeamProfileItems();
      });
		};

	}
]);
