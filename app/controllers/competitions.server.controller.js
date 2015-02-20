'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Competition = mongoose.model('Competition'),
  Ranking = mongoose.model('Ranking'),
  Matchup = mongoose.model('Matchup'),
  _ = require('lodash');

exports.create = function(req, res) {
  var comp = new Competition(req.body);

  comp.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(comp);
    }
  });
};

exports.list = function(req, res) {

  Competition.find().sort("-created").exec(function(err, comps){
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(comps);
    }
  });
};

exports.update = function(req, res) {
  var comp = req.comp;
  comp = _.extend(comp, req.body);
  comp.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(comp);
    }
  });
};

exports.delete = function(req, res) {
	var comp = req.comp;

	comp.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(comp);
		}
	});
};

exports.byId = function(req, res, next, id) {
  Competition.findById(id).exec(function(err, comp) {
    if (err) return next(err);
    if (!comp) return next(new Error('Failed to find Competition with id ' + id));
    req.comp = comp;
    next();
  })
};

exports.read = function(req, res) {
  res.json(req.comp);
};


exports.listRankings = function(req, res) {
  Ranking.find({competition:req.param('compId')}).sort(req.query.sortBy).populate('team','name').exec(function(err, teams){
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(teams);
    }
  });
};

exports.addRanking = function(req, res) {
  var team = new Ranking(req.body);
  team.save(function(err) {
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(team);
    }
  });
};

exports.hasAuthorization = function(req, res, next) {
	if(req.user.roles.indexOf('admin') !== -1) {
		next();
		return;
	}
		return res.status(403).send({
			message: 'User is not authorized'
		});
};
