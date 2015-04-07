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
  Competition.findById(id)
  .populate('rules settings', 'name')
  .exec(function(err, comp) {
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

exports.deleteRanking = function(req, res) {
	if(req.query.rankId)
  {
    Ranking.findOne({_id: req.query.rankId}, function(err,ranking){
      if(ranking)
      {
        ranking.remove(function(err){
          if(err){
      			return res.status(400).send({
      				message: errorHandler.getErrorMessage(err)
      			});
      		} else {
      			return res.status(200).send({
      				message: 'team removed'
      			});
      		}
        });
      }
    });
  }
  else
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
};

exports.generateMatchups = function(req, res) {
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





/////////Competition Wide (Multi-Week) Matchup Generator
/*
function MultiWeekGenerate(teams, weekLength, callback)
{
  var matchupCount = 0;

  for(int w=0;w<weekLength;w++) {

    for (var t = 0; t < teams.length/2; t++) {

      var matchup = new Matchup({
        competition: competition._id,
        week: w,
        home: teams[t],
        away: teams[teams.length-t],
      });

      matchup.save(function(err) {
        if (err) {
          return callback(err);
          });
        } else {
          matchupCount++;
        }
      });
    }

  }

}
*/

exports.hasAuthorization = function(req, res, next) {
	if(req.user.roles.indexOf('admin') !== -1) {
		next();
		return;
	}
		return res.status(403).send({
			message: 'User is not authorized'
		});
};
