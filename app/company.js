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
// company_views.ejs is to be designed 
	// views : function(req, res){
 //        connection.query("SELECT equip_id FROM views WHERE viewer_id= ?",req.body.viewer_id,function(err,rows){
 //            if(err) throw err;
 //            else{
 //                connection.query("SELECT * FROM all_equipment WHERE id= ?",rows[0].equip_id,function(err,rows1){
 //                    if(err)throw err;
 //                    else res.render('./company_views.ejs',{datarows:rows1,username:req.session.name});

 //                   });
                    
 //                }

 //        });

 //     },

    leads : function(req,res){

    
    },


};
