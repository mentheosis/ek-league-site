'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Settings',
	function($scope, Authentication, Settings) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.saveNewSetting = function() {
			$scope.resText = '';

			var newsetting = new Settings({
				category: 'about',
				name: this.newName,
				value: this.newValue
			});

			console.log(newsetting);

			newsetting.$save(function(res){
				$scope.newName = '';
				$scope.newValue = '';
				$scope.aboutItems.push(res);
				$scope.resText = 'Saved';
			});
		}

		$scope.aboutItems = [];
		$scope.getAboutItems = function() {
			$scope.aboutItems = Settings.query({category:'about'});
		}

		$scope.updateSettingWrap = function(setting, innerScope) {
			innerScope.editingItem = false;
			$scope.updateSetting(setting);
		}

		$scope.updateSetting = function(setting){
			setting.$update();
		}

		$scope.deleteSetting = function(setting) {
			setting.$remove();

			for (var i in $scope.aboutItems) {
				if ($scope.aboutItems[i] === setting) {
					$scope.aboutItems.splice(i, 1);
				}
			}
		}

	}
]);
