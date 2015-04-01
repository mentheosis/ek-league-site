'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$rootScope', '$stateParams', '$location', '$animate', '$timeout', 'Authentication', 'Articles', 'Comments',
	function($scope, $rootScope, $stateParams, $location, $animate, $timeout, Authentication, Articles, Comments) {
		$scope.authentication = Authentication;

		$scope.switchShowFull = function(repeatScope){
			repeatScope.showFull = !repeatScope.showFull;
		};

		$scope.createVisible = false;
		$scope.switchCreateVisible = function(){
			$scope.createVisible = !$scope.createVisible;
		};

		$scope.canEdit = function(post) {
			return ($rootScope.adminMode || post.user._id === Authentication.user._id)
		}

		$scope.create = function(parentString) {
			var article = new Articles({
				title: this.title,
				content: this.content,
				link: this.link
			});

			article.parent = parentString; //by default the articles list only shows where parent = 'top'
			article.user = this.user;
			article.imageurl = this.imageurl;

			article.$save(function(response) {
				//$location.path('articles/' + response._id);

				$scope.title = '';
				$scope.content = '';
				$scope.imageurl= '';
				article.user = Authentication.user;
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
				article.user = Authentication.user;
				$scope.comments.unshift(article); //display the new comment
				$scope.showComment = !$scope.showComment;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			$scope.confirmDelete = false;
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
			$scope.articles = Articles.list({parent:'top', limit:4, sortBy:($scope.sortDesc?'-':'') + $scope.sortBy});
		};

		$scope.listMsgs = function() {
			$scope.articles = Articles.list({parent:'msg', limit:25, sortBy:($scope.sortDesc?'-':'') + $scope.sortBy});
		}

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
