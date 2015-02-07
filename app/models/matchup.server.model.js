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

var MatchupSchema = new Schema({
  competition: {
    type: Schema.ObjectId,
    ref: 'Competition'
  },
  home: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  away: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  winner: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  loser: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  active: Boolean,
  MVP: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Matchup', MatchupSchema);
