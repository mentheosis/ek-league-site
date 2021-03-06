'use strict';

var users = require('../../app/controllers/users.server.controller');
var auth = require('../../app/controllers/users/users.authorization.server.controller');
var comps = require('../../app/controllers/competitions.server.controller');
var matchups = require('../../app/controllers/matchups.server.controller');

module.exports = function(app) {

  app.route('/competitions')
  .get(comps.list)
  .post(users.requiresLogin,
        auth.hasAuthorization(['admin']),
        comps.create);

  app.route('/competitions/:compId')
  .get(comps.read)
  .post(users.requiresLogin,
    auth.hasAuthorization(['admin']),
    comps.update)
  .delete(users.requiresLogin, comps.hasAuthorization, comps.delete);

  app.route('/rankings')
  .post(users.requiresLogin,
    //auth.hasAuthorization(['admin']),
    comps.addRanking)
  .get(comps.listRankings);

  app.route('/rankings/:rankingId')
  .put(users.requiresLogin,
    auth.hasAuthorization(['admin']),
    comps.updateRanking)
  .delete(users.requiresLogin,
    comps.deleteRanking);

  app.route('/matchups/:matchupId')
  .put(users.requiresLogin,
      matchups.update)
  .delete(users.requiresLogin,
    auth.hasAuthorization(['admin']),
    matchups.delete);

  app.route('/matchups/')
  .get(matchups.list)
  .post(users.requiresLogin,
    auth.hasAuthorization(['admin']),
    matchups.create);

  // Finish by binding the middleware
  app.param('compId', comps.byId);
  app.param('matchupId', matchups.byId);
  app.param('rankingId', comps.rankingById);


};
