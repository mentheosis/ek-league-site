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



var CompetitionSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    default: '',
    trim: true,
    required: 'Name cannot be blank'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  bannerurl: {
    type: String,
    default: '/modules/competitions/img/defaultCompBanner.png',
    trim: true
  },
  maps: {
    type: [{map: String, imageurl: String}],
    default: []
  },
  currentWeek: {
    type: Number,
    default: 1
  },
  champions: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  mvp: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  rules: {
    type: Schema.ObjectId,
    ref: 'Setting'
  },
  settings: {
    type: Schema.ObjectId,
    ref: 'Setting'
  },
});

mongoose.model('Competition', CompetitionSchema);
