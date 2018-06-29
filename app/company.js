// Company routes functions


// load all the things we need.
//var functions = require('./functions');
var others = require('./others');

var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

//connection.query('USE ' + dbconfig.connection.database);

// ========================================================

var schedule = require('node-schedule');

var express  = require('express');
var app = express();

module.exports = {
	home: function(req,res){
		res.render("");
	},

};