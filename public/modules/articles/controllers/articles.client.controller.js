'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', '$animate', '$timeout', 'Authentication', 'Articles', 'Comments',
	function($scope, $stateParams, $location, $animate, $timeout, Authentication, Articles, Comments) {
		$scope.authentication = Authentication;
		$scope.userSelectedColor = 'Blue';
		//if(authentication.user.color)
		//	$scope.userSelectedColor = authentication.user.color;

		var welcomeToTheSpot = [
			'Welcome to the Spot',
			'Your spot is now hit',
			'Cigarette spot, smoke em if you got em',
			'You are now a spot',
			'See spot play bongos',
			'There is no smoking in the spot',
			'Spotted leopards everywhere',
			'For all your spot hitting needs',
			'There once was a man from nantucket..',
			'I spy',
			'Somebody poisoned the other spot',
			'This is no child\'s spot',
			'This spot is worth two in the bush',
			'This is an open spot',
			'Small spot: handle with care',
			'The standard in out spot',
			'Your text spot studio',
			'A free spot',
		];
		$scope.WelcomeToTheSpot = welcomeToTheSpot[Math.floor(Math.random()*welcomeToTheSpot.length)];

		$scope.switchShowFull = function(repeatScope){
			repeatScope.showFull = !repeatScope.showFull;
		};

		$scope.colorsVisible = false;
		$scope.switchColorsVisible = function(){
			$scope.colorsVisible = !$scope.colorsVisible;
		};

		$scope.createVisible = false;
		$scope.switchCreateVisible = function(){
			$scope.createVisible = !$scope.createVisible;
		};

		$scope.simpleUI = false;
		$scope.switchSimpleUI = function(){
			$scope.simpleUI = !$scope.simpleUI;
		};


		$scope.create = function() {
			var article = new Articles({
				title: this.title,
				content: this.content
			});

			article.parent = 'top'; //by default the articles list only shows where parent = 'top'
			article.user = this.user;

			article.$save(function(response) {
				//$location.path('articles/' + response._id);

				$scope.title = '';
				$scope.content = '';
				$scope.articles.unshift(article); //push it to the display
				$scope.createVisible = !$scope.createVisible;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.createComment = function(parentId) {
			var article = new Articles({
				//parent: this.parentId,
				//title: $scope.parentId.toString(),
				content: this.content
			});
			article.title = 'comment';
			article.parent = $scope.article._id; //this.parentId;
			article.$save(function(response) {
				//$location.path('articles/' + response._id);

				//$scope.title = '';
				$scope.content = '';
				$scope.comments.unshift(article); //display the new comment
				$scope.showComment = !$scope.showComment;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//init the comment field to hidden on load
		$scope.showComment = false;
		$scope.showcomment = function(){
			$scope.showComment = !$scope.showComment;
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.kismet = function(article, articleScope) {
			if(!article)
			{
				article = $scope.article;
			}
			article.kismet += 1;
			article.$kismet(function() {
				//$location.path('articles/' + article._id);
			}, function(errorResponse) {
				article.kismet -= 1;
				articleScope.thisError = errorResponse.data.message;
				articleScope.showError=true;
				$timeout(function(){
					articleScope.showError=false;
				},2000);
			});
		};

		$scope.unkismet = function() {
			var article = $scope.article;

			article.kismet -= 1;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.sortBy = 'created';
		$scope.sortDesc = true;
		$scope.sortAndUpdate = function(sorter){
			if(sorter==='reverse')
				$scope.sortDesc = !$scope.sortDesc;
			else
			{
				$scope.sortBy = sorter;
			}

			$scope.find();
		};

		//$scope.now = Date.now();
		//$scope.fuck = 'ug'; //$scope.articles[1].created;
		//$scope.check = $scope.dateDiffInDays(now,$scope.articles[1].created);

		$scope.dateDiffInDays = function (a, b) {
			var _MS_PER_DAY = 1000 * 60 * 60 * 24;
			// Discard the time and time-zone information.
			var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
			var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
			return (utc2 - utc1) / _MS_PER_DAY;
			//return Math.floor((utc2 - utc1) / _MS_PER_DAY);
		};

/*
		$scope.sortArticles = function(){
			articles.sort(function(a,b){
				var ageA = Date.Now - a.created;
				var ageB = Date.Now - b.created;

				if(a.Created)
			})
		}
*/
		$scope.find = function() {
			//$scope.articles = Articles.query();
			$scope.articles = Articles.list({sortBy:($scope.sortDesc?'-':'') + $scope.sortBy});
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
			$scope.comments = //['one','two','three'];
			Comments.query({
				parentId: $stateParams.articleId
			});
		};

	}
]);
