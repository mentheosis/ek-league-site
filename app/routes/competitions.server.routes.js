'use strict';

var users = require('../../app/controllers/users.server.controller');
var auth = require('../../app/controllers/users/users.authorization.server.controller');
var comps = require('../../app/controllers/competitions.server.controller');

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
    auth.hasAuthorization(['admin']),
    comps.addRanking);

  app.route('/rankings/:compId')
  .get(comps.listRankings);

  /*
  .put(users.requiresLogin,articles.hasAuthorization,articles.update)
  .delete(users.requiresLogin, articles.hasAuthorization, articles.delete)
  */

  // Finish by binding the middleware
  app.param('compId', comps.byId);

};
