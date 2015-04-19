'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Competition = mongoose.model('Competition'),
  Matchup = mongoose.model('Matchup'),
  Ranking = mongoose.model('Ranking'),
  _ = require('lodash');

exports.create = function(req, res) {

  if(req.query.compId){
    generateMatchups(req,res);
  }
  else{
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
  }
};

exports.list = function(req, res) {

  if(!req.query.compId) {
    return res.status(500).send({ message: 'Improper request', })
  }

  Competition.findById(req.query.compId).exec(function(err, comp) {
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!comp) {
      return res.status(400).send({
        message: 'No competition with id ' + req.query.compId
      });
    } else {

      Matchup.find({competition: comp._id, week: comp.currentWeek})
        .populate('home away', 'name imageurl')
        //.populate({path:'away', select: 'name imageurl', model: 'Team'})
        .exec(function(err, matchups) {
          if(err) { return res.status(500).send({  message: errorHandler.getErrorMessage(err) }); }
          res.json(matchups);
        });

    }
  });
}

exports.update = function(req, res) {

  if(req.body.home._id){req.body.home = req.body.home._id;}
  if(req.body.away._id){req.body.away = req.body.away._id;}

  var matchup = req.matchup;
  matchup = _.extend(matchup, req.body);

  console.log('saving. ', matchup)

  matchup.save(function(err) {
    if (err) {
      console.log('err ', err)
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

function generateMatchups(req, res) {
  if(!req.query.compId) {
    return res.status(500).send({ message: 'Improper request', })
  }

  Competition.findById(req.query.compId).exec(function(err, comp) {
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!comp) {
      return res.status(400).send({
        message: 'No competition with id ' + req.query.compId
      });
    } else {

      Matchup.find({competition: comp._id, week: comp.currentWeek}).remove(function(err) {
        if(err) { return res.status(500).send({  message: errorHandler.getErrorMessage(err) }); }

        Ranking.find({ competition: comp._id }).exec(function(err, teams){
          if (err) {
            return res.status(500).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {

            SingleWeekGenerate(teams, comp._id, comp.currentWeek, function(err, matchupCount) {
              if(err) {
                return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
              }
              res.json(matchupCount);
            });
          }
        });
      });
    }
  });
}

function SingleWeekGenerate(teams, compId, weekNo, callback)
{
  var matchups = [];
  var matchupCount = 0;

  if(teams.length % 2 != 0)
  {
    //AddByesToTeamList()
  }

  for (var t = 0; t < teams.length/2; t++) {
    var t_f = teams.length - 1 - t;
  //  console.log(teams[t]);
  //  console.log("vs");
  //  console.log(teams[t_f]);

    var matchup = new Matchup({
      competition: compId,
      week: weekNo,
      home: teams[t].team,
      away: teams[t_f].team,
    });

    matchup.save(function(err) {
      if (err) {
        return callback(err);
      } else {
        //TODO: wait until all matchups save and then callback(null, matchups)
      }
    });
    matchupCount++;
  }
  callback(null, matchupCount);
}


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
