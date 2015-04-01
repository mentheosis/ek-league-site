'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Settings = mongoose.model('Setting'),
	_ = require('lodash');


exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req
	});
};

exports.saveSetting = function(req, res) {
		var setting = new Settings(req.body);
		setting.save(function(err, reSetting){
			if(err) {
				return res.status(500).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			return res.json(reSetting);
		});
}

var initSetting = function(settingName, settingValue) {
	console.log("initializing setting");
	var setting = new Settings({
		name: settingName,
		value: settingValue
	});

	setting.save();
};

exports.changeSetting = function(req, res) {
	//console.log(JSON.stringify(req.query));

	if(req.query.settingName && req.query.settingValue) //single setting
	{
		var settingName = req.query.settingName;
		var settingValue = req.query.settingValue;
		//console.log('saving setting: '+settingName+' val: '+settingValue);

		Settings.update(
			{name: settingName},
			{$set: {value: settingValue}},
			{},
			function(err, rowsAffected) {
				//console.log('updated '+rowsAffected);
			});

		Settings.findOne({name: settingName}).exec(function(err,setting){
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else if(!setting)	{
					initSetting(settingName, settingValue);
			}	else {
				res.json(setting);
			}
		});
	}
	else
	{
		//else return all settings, not implemented
		res.json({});
	}

};

exports.getSettings = function(req, res) {

	if(req.query.settingName) //single setting
	{
		var settingName = req.query.settingName;

		Settings.findOne({name: settingName}).exec(function(err,setting){
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				//console.log("sending setting " + JSON.stringify(setting));
				return res.json(setting);
			}
		});
	}

	else if(req.query.category) //single category
	{
		Settings.find({category: req.query.category}).exec(function(err,settings){
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				//console.log("sending setting " + JSON.stringify(setting));
				return res.json(settings);
			}
		});
	}

	else
	{
		//else return all settings, not implemented
		return res.status(500).send({
			message: 'not implemented'
		});
	}
};

exports.updateSetting = function(req, res) {
	var setting = req.setting;

	setting = _.extend(setting, req.body);

	setting.save(function(err, updated) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			return res.json(updated);
		}
	});
}

exports.deleteSetting = function(req, res) {
	var setting = req.setting;

	setting.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.status(200).send({
				message: 'setting deleted'
			});
		}
	});
};


exports.settingByID = function(req, res, next, id) {
	Settings.findById(id).exec(function(err, setting) {
		if (err) return next(err);
		if (!setting) return next(new Error('Failed to load setting ' + id));
		req.setting = setting;
		next();
	});
};
