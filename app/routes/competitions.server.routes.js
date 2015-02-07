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
  .get(comps.read);
  /*
  .put(users.requiresLogin,articles.hasAuthorization,articles.update)
  .delete(users.requiresLogin, articles.hasAuthorization, articles.delete)
  .post(
    users.requiresLogin,
    //users.getAddress,
    //cp_api.send_kismet,
    articles.kismet);
  */

  // Finish by binding the article middleware
  app.param('compId', comps.byId);

};
