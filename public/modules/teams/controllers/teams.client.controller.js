'use strict';

Array.prototype.indexOfUsername = function(username) {
    for (var i = 0; i < this.length; i++)
        if (this[i].username === username)
            return i;
    return -1;
}

angular.module('teams').controller('TeamsController', ['$scope', '$stateParams', '$location', '$animate', '$timeout', 'Authentication', 'Teams',
	function($scope, $stateParams, $location, $animate, $timeout, Authentication, Teams) {
		$scope.authentication = Authentication;
		//if(authentication.user.color)
		//	$scope.userSelectedColor = authentication.user.color;

		$scope.indexOfUsername = function(id){
			return this.indexOfUsername(id);
		}

		$scope.joinpassword='';
		$scope.joinTeam = function() {
			$scope.errText = '';
			if(Authentication.user && $scope.team && $scope.team.members.indexOfUsername(Authentication.user.username) === -1)
			{
				$scope.team.password = $scope.joinpassword;
				//$scope.team.members.push(Authentication.user._id);
				$scope.team.$save({newMember: Authentication.user.username},
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
				//$scope.team.members.push(Authentication.user._id);
				$scope.team.$save({removeMember: Authentication.user.username},
					function(team){
						$scope.team = team;
					});
			}
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
			$scope.team = Teams.get({
				teamId: $stateParams.teamId
			});
		};

	}
]);
