'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$sce', '$rootScope', '$location', '$timeout', 'Authentication', 'Users', 'Settings', 'Menus',
	function($scope, $sce, $rootScope, $location, $timeout, Authentication, Users, Settings, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');



		$scope.goToMyTeam = function(){
			var userFromDb = Users.get({userId:Authentication.user._id}, function(){
				if(userFromDb.team && userFromDb.team._id !== '')
					$location.url('/teams/'+userFromDb.team._id);
				else
					$location.url('/teams');
			});
		}

    $scope.targetDate = new Date(2015, 2, 15, 0);
    $scope.now = new Date();
		$scope.showCountdownLogin = false;

    function dateDiff(now, later) {
      var diffMs = later - now;

      var secMs = 1000;
      var minMs = secMs * 60;
      var hourMs = minMs * 60;
      var dayMs = hourMs * 24;

      var diffDays = Math.floor(diffMs / dayMs);
      var diffHours = Math.floor((diffMs % dayMs) / hourMs);
      var diffMins = Math.floor((diffMs % hourMs) / minMs);
      var diffSec = Math.floor((diffMs % minMs) / secMs);

      return {
        day: diffDays.toString(),
        hour: diffHours.toString(),
        min: diffMins.toString(),
        sec: diffSec.toString()
        }
    }

    $scope.counter = dateDiff($scope.now, $scope.targetDate);

    $scope.onTimeout = function(){
        $scope.now = new Date();
        $scope.counter = dateDiff($scope.now, $scope.targetDate);
        mytimeout = $timeout($scope.onTimeout,1000);
    }
    var mytimeout = $timeout($scope.onTimeout,1000);



		$rootScope.adminMode = false;
		$scope.switchAdminMode = function(){
			$rootScope.adminMode = !$rootScope.adminMode;
		};

		$scope.editBanner = false;
		$scope.switchEditBanner = function(){
			$scope.editBanner = !$scope.editBanner;

			if($scope.newBanner && $scope.newBanner !== '')
			{
				Settings.update({settingName:'bannerScroll', settingValue:$scope.newBanner});

				$scope.bannerHtml =
					$sce.trustAsHtml('<marquee class="top-scroll" behavior="scroll" direction="left">'
					+$scope.newBanner
					+'</marquee>');
				$scope.newBanner='';
			}
		};

		$scope.getBanner = function() {
			Settings.get({settingName:'bannerScroll'},
				function(response){
					$scope.bannerHtml =
						$sce.trustAsHtml('<marquee class="top-scroll" behavior="scroll" direction="left">'
						+response.value
						+'</marquee>');
				}
			);
		}

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
