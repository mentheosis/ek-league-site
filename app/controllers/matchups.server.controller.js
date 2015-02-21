'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Competition = mongoose.model('Competition'),
  Matchup = mongoose.model('Matchup'),
  Ranking = mongoose.model('Ranking'),
  _ = require('lodash');

exports.create = function(req, res) {
  var matchup = new Matchup(req.body);

  matchup.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(matchup);
    }
  });
};

exports.list = function(req, res) {

  if(!req.comp._id) { 
    return res.status(500).send({ message: 'Improper request', })
  }

  Competition.findById(req.comp._id).exec(function(err, comp) {
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!comp) {
      return res.status(400).send({ 
        message: 'No competition with id ' + req.query.compId
      });
    } else {

      Matchup.find({competition: comp._id, week: comp.currentWeek}).exec(function(err, matchups) {
        if(err) { return res.status(500).send({  message: errorHandler.getErrorMessage(err) }); }
        res.json(matchups);
      });

    }
  });
}

exports.update = function(req, res) {
  var matchup = req.matchup;
  matchup = _.extend(matchup, req.body);
  matchup.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(matchup);
    }
  });
};

exports.delete = function(req, res) {
	var matchup = req.matchup;

	matchup.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(matchup);
		}
	});
};

exports.byId = function(req, res, next, id) {
  Matchup.findById(id).exec(function(err, matchup) {
    if (err) return next(err);
    if (!matchup) return next(new Error('Failed to find Matchup with id ' + id));
    req.matchup = matchup;
    next();
  })
};

exports.read = function(req, res) {
  res.json(req.matchup);
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