'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

/**
* Competiton Schemas:

Competitions: {
Name: '5v5Hotwire',
Weeks: ['Dalian', 'NYC', 'Metro'],
Champion: teamRef,
MVP: userRef
}

Ranking: {
Competition: leagueRef,
Team: TeamRef,
Wins: 0,
Losses: 0,
Ties: 0
}

Matchups: {
Week: 1
League: leagueRef,
Home: teamRef,
Away: teamRef,
Winner: nul,
Loser: nul,
Active: true,
MVP: userRef
}
*/


var RankingSchema = new Schema({
  competition: {
    type: Schema.ObjectId,
    ref: 'Competition'
  },
  team: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  wins: {type: Number, default: 0},
  losses: {type: Number, default: 0},
  ties: {type: Number, default: 0},
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Ranking', RankingSchema);
