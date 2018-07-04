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

var isLoggedIn = function(req, res) {  
        var x ;
        if (req.isAuthenticated()) x=1;
        else x = 0;
        return x;
    };

module.exports = {
	home: function(req,res){
		res.render("bank_index.ejs", {username: req.session.name});
	},

	leads : function(req,res){
		connection.query("SELECT * FROM equipment_type INNER JOIN requests ON CONCAT('t', equipment_type.type_id) = requests.equip_id WHERE request.status = 2",function(err,rows){
			if(err) throw err;
			else res.send("ho gaya");
		});    
    },

    previous_deals : function(req,res){
    	connection.query("SELECT * FROM equipment_type INNER JOIN requests ON CONCAT('t', equipment_type.type_id) = requests.equip_id WHERE (request.status = 3 OR request.status = 4",function(err,rows){
    		if(err) throw err;
    		else res.send("ho gaya");
    	});
    },

    add_proposal: function(req,res){
    	var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) dd = '0'+dd;
        if(mm<10) mm = '0'+mm; 
        today = dd + '/' + mm + '/' + yyyy;

        var radicle = '';
		connection.query("SELECT id FROM proposals ORDER BY id ASC", function(err,rows){
	    	if(err) throw err;
	    	else {
	            if(rows.length)	radicle = rows.slice(-1)[0].id + 1;
	            else radicle = 1;
		        
		        docname = req.files.proposal.name;
		        resultd = docname.split('.');
		        doc_name = 'b'+radicle+'.'+resultd.slice(-1) ;
		        doc.mv('docs/proposals/'+doc_name , function(err3){           
		            if (err3) throw err3;
		            else {
		            	connection.query("INSERT INTO proposals (request_sno, doc_name,status,date) VALUES (?,?,?,?)",[ req.params.sno,doc_name,0,today],function(err1,rows1){
		            		if(err1) throw err1;
		            		else res.send("something");
		            	});
		            }
		        });
		    }
		});            
    },

    details: function(req,res){
    	connection.query("SELECT * FROM proposals WHERE requests_sno = ?",[req.params.sno], function(err,res){
    		if(err) throw err;
    		else{
                //sort bank proposals
            }
    	})
    } 
}
