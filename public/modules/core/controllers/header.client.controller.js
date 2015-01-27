'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$sce', '$rootScope', 'Authentication', 'Settings', 'Menus',
	function($scope, $sce, $rootScope, Authentication, Settings, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

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
