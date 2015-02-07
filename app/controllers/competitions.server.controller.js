'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Competition = mongoose.model('Competition'),
  Ranking = mongoose.model('Ranking'),
  Matchup = mongoose.model('Matchup');

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

  Competition.find(function(err, comps){
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(comps);
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

/*
exports.update = function(req, res) {
  var article = req.article;

  //console.log('resetting parent');
  //article.parent = '';//article.id;

  article = _.extend(article, req.body);

  article.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

exports.delete = function(req, res) {
  var article = req.article;

  article.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};
*/
