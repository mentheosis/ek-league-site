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
  .delete(users.requiresLogin,
    comps.deleteRanking);

  app.route('/rankings/:compId')
  .get(comps.listRankings);

  app.route('/matchups/:compId')
  .get(matchups.list)
  .post(users.requiresLogin,
    auth.hasAuthorization(['admin']),
    comps.generateMatchups);

  // Finish by binding the middleware
  app.param('compId', comps.byId);

};
