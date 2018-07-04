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
		res.render("company_index.ejs", {username: req.session.name});
	},

	my_equipment : function(req, res){
		connection.query("SELECT * FROM equipment_type WHERE brand = ?", [], function(err,rows){
			if(err) throw err;
			else{
				var str = "SELECT views.equip_id, count(views.equip_id) as no_views FROM views INNER JOIN equipment_type ON CONCAT('t',equipment_type.type_id) = views.equip_id WHERE equipment_type.brand = ? GROUP BY views.equip_id;";
                connection.query(str,[], function(err1,rows1){
                    if(err1) throw err1;
                    else{
                        str = "SELECT requests.equip_id, count(requests.equip_id) as no_requests FROM requests INNER JOIN equipment_type ON CONCAT('t',equipment_type.type_id) = requests.equip_id WHERE equipment_type.brand = ? GROUP BY requests.equip_id;";
                        connection.query(str,[], function(err2,rows2){
                            if(err2) throw err2;
                            else{
                            	var data = [];
                            	for(var i =0; i<rows.length; i++){
                                    data[i] = {
                                        views : '',
                                        requests: ''
                                    }

                                    for(var j = 0 ; j <rows1.length; j++){
                                        if(rows[i].id == rows1[j].equip_id){
                                            data[i].views = rows1[j].no_views;
                                            break;
                                        }
                                    }
                                    if(!data[i].views) data[i].views = 0;
                                    
                                    for(var j = 0 ; j <rows2.length; j++){
                                        if(rows[i].id == rows2[j].equip_id){
                                            data[i].requests = rows2[j].no_requests;
                                            break;
                                        }
                                    }
                                    if(!data[i].requests) data[i].requests = 0;
                                }
                                res.send("done");
                            }
                        });    	
 					}
 				});	
			}
		});
	},          

    leads : function(req,res){
		connection.query("SELECT * FROM equipment_type INNER JOIN requests ON CONCAT('t', equipment_type.type_id) = requests.equip_id WHERE equipment_type.brand = ? AND request.status = 2",[],function(err,rows){
			if(err) throw err;
			else res.send("ho gaya");
		});    
    },

    add_new_equipment: function(req,res){
    	// make admin functionality of equipment master
    },

    previous_deals : function(req,res){
    	connection.query("SELECT * FROM equipment_type INNER JOIN requests ON CONCAT('t', equipment_type.type_id) = requests.equip_id WHERE equipment_type.brand = ? AND (request.status = 3 OR request.status = 4",[],function(err,rows){
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
		        doc_name = 'c'+radicle+'.'+resultd.slice(-1) ;
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
    		else {
                //sort company proposals
            }
    	})
    } 
}
