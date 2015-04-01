'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'ekleague';
	var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'luegg.directives'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('bfh');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles', ['ngAnimate']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('competitions');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('scrim-finder');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('teams');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
/*
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Posts', 'articles', 'dropdown', '/articles(/create)?');
		Menus.addSubMenuItem('topbar', 'articles', 'All Posts', 'articles');
		Menus.addSubMenuItem('topbar', 'articles', 'New Post', 'articles/create');
	}
]);
*/

'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listArticles', {
			url: '/articles',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('msgboard', {
			url: '/msgboard',
			templateUrl: 'modules/articles/views/msgboard.client.view.html'
		}).
		state('createArticle', {
			url: '/articles/create',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('viewArticle', {
			url: '/articles/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('editArticle', {
			url: '/articles/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);

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

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles')
	.factory('Articles', //the name of the resource Class
	['$resource',
	function($resource) {
		return $resource('articles/:articleId',
		{
			articleId: '@_id',
		},
		{
			update: {
				method: 'PUT'
			},
			kismet: {
				method: 'POST',
				params: {
					jsonrpc:'2.0',
					method:'send_kismet',
					params:{amt:1},
					id:Date.now,
				}
			},
			list: {
				method: 'GET',
				isArray: true,
				params: {
					sortBy: '@sortBy' //$scope.sorter
				}
			}
		});
	}
]);


//Comments service used for communicating with the articles REST endpoints
angular.module('articles')
	.factory('Comments', //the name of the resource Class
	['$resource',
	function($resource) {
		return $resource('comments/:parentId',
		{
			parentId: '@parent',
		});
	}
]);

'use strict';

// Setting up route
angular.module('competitions').config(['$stateProvider',
function($stateProvider) {

  $stateProvider.
  state('competitions', {
    url: '/competitions',
    templateUrl: 'modules/competitions/views/competitions.client.view.html'
  });

  $stateProvider.
  state('manage-comps', {
    url: '/manage-comps',
    templateUrl: 'modules/competitions/views/manage-comps.client.view.html'
  });

  $stateProvider.
  state('comp-detail', {
    url: '/competitions/:compId',
    templateUrl: 'modules/competitions/views/comp-detail.client.view.html'
  });

}
]);

'use strict';

angular.module('competitions').controller('CompController', ['$scope', '$stateParams', 'Authentication', 'Users', 'Competitions', 'Rankings', 'Teams', 'Matchups',
function($scope, $stateParams, Authentication, Users, Competitions, Rankings, Teams, Matchups) {
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


}
]);

'use strict';

angular.module('competitions')
  .factory('Competitions', //the name of the resource Class
  ['$resource',
  function($resource) {
    return $resource('competitions/:compId',
    {
      compId: '@_id',
    });
}
]);

'use strict';

angular.module('competitions')
  .factory('Matchups', //the name of the resource Class
  ['$resource',
  function($resource) {
    return $resource('matchups/:compId',
    {
      matchupId: '@_id',
    },
    {
      generate: {
        method: 'POST',
        //isArray: true,
        //params: { sortBy: '@sortBy', },
      },
      list: {
        method: 'GET',
        isArray: true,
        params: { compId: '@compId' }
      }
    });
  }
]);

'use strict';

angular.module('competitions')
  .factory('Rankings', //the name of the resource Class
  ['$resource',
  function($resource) {
    return $resource('rankings/:compId',
    {
      rankId: '@_id',
    },
    {
      list: {
        method: 'GET',
        isArray: true,
        params: {
          sortBy: '@sortBy'
        }
      }
    });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		});

		$stateProvider.
		state('about', {
			url: '/about',
			templateUrl: 'modules/core/views/about.client.view.html'
		});

	}
]);

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

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

//Comments service used for communicating with the articles REST endpoints
angular.module('core')
.factory('Settings', //the name of the resource Class
['$resource',
function($resource) {
  return $resource('settings/:settingId',
  {
    settingId: '@_id',
  },
  {
    update: {
      method: 'PUT',
      params: {
        settingName: '@settingName',
        settingValue: '@settingValue'
      }
    }
  }
  );}
]);

'use strict';

// Setting up route
angular.module('scrim-finder').config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider.
  state('scrim', {
    url: '/scrim',
    templateUrl: 'modules/scrim-finder/views/scrim.client.view.html'
  });

}
]);

'use strict';

angular.module('scrim-finder').controller('ScrimController', ['$scope', '$rootScope', 'Authentication', 'Scrims', 'SocketIO', 'Teams',
function($scope, $rootScope, Authentication, Scrims, SocketIO, Teams) {

  // This provides Authentication context.
  $scope.authentication = Authentication;
  $scope.chatMessages = [];

  $scope.createVisible = false;
  $scope.switchCreateVisible = function(){
    $scope.createVisible = !$scope.createVisible;
  };

  /*
  function findTeam() {
    if(Authentication.user.team) {
      $scope.team = Teams.get({
				teamId: Authentication.user.team
			});
    }
  }
  //get user team at load
  findTeam();
  */

  $scope.createScrim = function() {
    var image;
    if(!Authentication.user.avatar) {
      image = '/modules/core/img/default-avatar.png'
    }
    else {
      image = Authentication.user.avatar
    }

    var scrim = new Scrims({
      map: this.map,
      format: this.format,
      notes: this.notes,
      time: this.time,
      imageurl: image,
      team: Authentication.user.username
    });

    scrim.$save(function(response) {
      //$location.path('articles/' + response._id);
      $scope.switchCreateVisible();

      $scope.map = '';
      $scope.format = '';
      $scope.notes = '';
      $scope.time = '';
      //the unshift is now handled by sockets!
      //$scope.scrims.unshift(scrim); //push it to the display
      //$scope.createVisible = !$scope.createVisible;
    }, function(errorResponse) {
      $scope.error = errorResponse.data.message;
    });
  };

  $scope.sendChat = function(msg) {
    if(msg !== '')
    {
      SocketIO.emit('scrim-chat', { user: Authentication.user.username, message:msg});
      $scope.chatMsg='';
    }
  };

  $scope.isScrimCreator = function (scrim) {
    return scrim.team === Authentication.user.username
  }

  $scope.canSeePrivateChat = function (scrim) {
    return ((scrim.team === Authentication.user.username && scrim.acceptedUser !== "")
      || scrim.acceptedUser === Authentication.user.username)
  }

  $scope.hasReplies = function (scrim) {

    return $scope.isScrimCreator(scrim) && scrim.replies.length >= 1;
  }

  $scope.replied = function (scrim) {
    return !$scope.isScrimCreator(scrim) && scrim.replies.indexOf(Authentication.user.username) !== -1
  }

  $scope.scrimFinalized = function(scrim) {
    return scrim.acceptedUser && scrim.acceptedUser !== "";
  };

  $scope.replyToScrim = function(scrimId) {
    SocketIO.emit('scrim reply', { scrim: scrimId, user: Authentication.user.username })
  };

  $scope.acceptReply = function(scrimId, acceptedUser) {
    SocketIO.emit('scrim accept', { scrim: scrimId, user: acceptedUser })
  };

  $scope.saveHomeInfo = function (scrim) {
    SocketIO.emit('home info', { 'scrim': scrim._id, 'home': scrim.homeInfo })
  };
  $scope.saveAwayInfo = function (scrim) {
    SocketIO.emit('away info', { 'scrim': scrim._id, 'away': scrim.awayInfo })
  };


  $scope.orderScrims = function(scrim) {
    if($scope.canSeePrivateChat(scrim))
      return 0
    else if($scope.replied(scrim) || $scope.hasReplies(scrim))
      return 1
    else if(scrim.acceptedUser && scrim.acceptedUser !== "")
      return 99
    else
      return 55
  };

  $scope.initialize = function(){
    SocketIO.emit('initialize chat', {user: Authentication.user.username});
    $scope.scrims = Scrims.query();
  };

  /*
    if you leave the scrim page and return, the scrim controller
    is destroyed and recreated, but the original event listener
    for chat messages still exists, so now you've got two. They
    keep multiplying as you leave and return to the scrim page.

    Must cleanup listeners when the scope is destroyed! */
  $scope.$on('$destroy', function() {
    if(clearChatListener) { clearChatListener(); }
    if(clearInitlistener) { clearInitlistener(); }
    if(clearUserListener) { clearUserListener(); }
    if(clearAddListener) { clearAddListener(); }
    if(clearUpdateListener) { clearUpdateListener(); }
    SocketIO.emit('exiting chat', {user: Authentication.user.username});
  });


  var clearHomeInfoListener = SocketIO.on('home info updated', function(req){
    for (var s = 0; s < $scope.scrims.length; s++ ){
      if ($scope.scrims[s]._id === req.scrim) {
        //$scope.scrims.splice(s, 1, scrim);
        $scope.scrims[s].homeInfo = req.home;
        return;
      }
    }
  });

  var clearAwayInfoListener = SocketIO.on('away info updated', function(req){
    for (var s = 0; s < $scope.scrims.length; s++ ){
      if ($scope.scrims[s]._id === req.scrim) {
        //$scope.scrims.splice(s, 1, scrim);
        $scope.scrims[s].awayInfo = req.away;
        return;
      }
    }
  });

  var clearUpdateListener = SocketIO.on('scrim updated', function(scrim){
    for (var s = 0; s < $scope.scrims.length; s++ ){
      if ($scope.scrims[s]._id === scrim._id) {
        $scope.scrims.splice(s, 1, scrim);
        return;
      }
    }
  });

  var clearAddListener = SocketIO.on('scrim added', function(scrim){
    $scope.scrims.unshift(scrim);
  });

  var clearChatListener = SocketIO.on('chat message', function(msg){
    $scope.chatMessages.push(msg);
  });

  var clearInitlistener = SocketIO.on('initialize chat', function(res){
    $scope.chatMessages = res;
  });

  $scope.userList = []
  var clearUserListener = SocketIO.on('update userlist', function(userlist){
    console.log('got userlist')
    console.log(JSON.stringify(userlist));
    $scope.userList = userlist;
  });


}
]);

'use strict';

//Comments service used for communicating with the articles REST endpoints
angular.module('scrim-finder')
.factory('Scrims', //the name of the resource Class
['$resource',
function($resource) {
  return $resource('scrims/:postId',
{
  postId: '@_id',
});
}
]);

angular.module('scrim-finder')
  .factory('SocketIO', ['$rootScope', function ($rootScope) {
  var socket = io(); //references script file loaded in layout html.

  return{

    on: function (eventName, callback) {

      socket.on(eventName, wrapper);

      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }

  };
}]);

'use strict';

// Setting up route
angular.module('teams').config(['$stateProvider',
	function($stateProvider) {

		// Teams state routing
		$stateProvider.
		state('listTeams', {
			url: '/teams',
			templateUrl: 'modules/teams/views/grid-teams.client.view.html'
		});

		$stateProvider.
		state('createTeam', {
			url: '/teams/create',
			templateUrl: 'modules/teams/views/create-team.client.view.html'
		});

		$stateProvider.
		state('viewTeam', {
			url: '/teams/:teamId',
			templateUrl: 'modules/teams/views/team-bio.client.view.html'
		});

		$stateProvider.
		state('editTeam', {
			url: '/teams/:teamId/edit',
			templateUrl: 'modules/teams/views/edit-team.client.view.html'
		});
	}
]);

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

'use strict';

//Teams service used for communicating with the teams REST endpoints
angular.module('teams')
	.factory('Teams', //the name of the resource Class
	['$resource',
	function($resource) {
		return $resource('teams/:teamId',
		{
			teamId: '@_id',
		},
		{
			update: {
				method: 'PUT'
			},
			list: {
				method: 'GET',
				isArray: true,
				params: {
					sortBy: '@sortBy' //$scope.sorter
				}
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		// if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;
			$scope.clicked = 'processing request';

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users/:userId', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
