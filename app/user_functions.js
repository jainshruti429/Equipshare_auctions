//functions/API of a logged in user.

// Loads up config for connection
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

//connection.query('USE ' + dbconfig.database);

const notifier = require('node-notifier');

var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');

// //=================================================

var ssn;//variable of session
var schedule = require('node-schedule');

var express  = require('express');
var app = express();
var crypto = require('crypto');

// //=================================================

var general_functions = require("./general_functions");

//general check if category is user or dealer
var user_access = function access(req,res){
    if(req.session.category==1) return 1;
    else return 0;
} 

var isLoggedIn = function(req, res) {  
        var x ;
        if (req.isAuthenticated()) x=1;
        else x = 0;
        return x;
    };

var cat_rows = [];
connection.query("SELECT DISTINCT category FROM equipment_type", function(errc,crows){
    if(errc) {
	    console.log(errc);
	    throw errc;
    }
    else cat_rows = crows;
});

var index_featured = [];
connection.query("SELECT all_equipment.photo1, all_equipment.expected_price, all_equipment.subcategory,all_equipment.category, all_equipment.brand, all_equipment.model, all_equipment.id FROM all_equipment INNER JOIN featured ON featured.equip_id = all_equipment.id WHERE featured.display = 1",function(errf,featured){
    if(errf) throw errf;
    else index_featured = featured;
});

var msg;
var new_equip = [];
var used_equip = [];


module.exports =  {
   
    //-------------------------------user funct 30-06-2018-------------------------------------------------
     //    // views for user  )(user_views.ejs is to be designed)
     //    views : function(req, res){
     //    connection.query("SELECT equip_id FROM views WHERE viewer_id= ?",req.body.viewer_id,function(err,rows){
     //        if(err) throw err;
     //        else{
     //            connection.query("SELECT * FROM all_equipment WHERE id= ?",rows[0].equip_id,function(err,rows1){
     //                if(err)throw err;
     //                else res.render('./user_views.ejs',{datarows:rows1,username:req.session.name});

     //            });
                    
     //        }

     //    });

     // },



//---------------------------------------------------------------------------------------------------------





    //get_login and post_login: in routes page...passport k pain tha
    dashboard: function(req,res){
        res.render("./new_dashboard.ejs");
    },

    saved_searches : function(req,res){
        connection.query("SELECT * FROM save WHERE user_id = ?" , [req.session.user],function(err,rows){
            if(err) throw err;
            else res.render("./user_saved_searches.ejs", {datarows:rows});
        });
    },

    save_search : function(req,res){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) dd = '0'+dd;
        if(mm<10) mm = '0'+mm; 
        today = dd + '/' + mm + '/' + yyyy;
        connection.query("INSERT INTO save (user_id, date,subcategory) VALUES (?,?,?)", [req.session.user, today,req.session.subcategory], function(err,rows){
            if(err) throw err;
            else return res.send("ho gaya");
        });
    },    

    request_this: function(req,res){
        equip_id = req.params.id;
        if(user_access(req,res)){
            var applicant_id = req.session.user;
            //if (applicant_id != req.params.owner_id){    
                connection.query("SELECT * FROM requests WHERE equip_id = ? AND applicant_id = ?",[equip_id, applicant_id],function(err2, row2){
                    if(err2) throw err2;
                    if(!row2.length){ //if viewer is not already added in the list
                        connection.query("INSERT INTO requests (equip_id, applicant_id) VALUES (?,?)", [equip_id, applicant_id], function(err){
                            if(err) throw err;
                        });
                    }
                });
            //}
        }
        if(equip_id[0]!= 't'){
            connection.query("SELECT * FROM all_equipment WHERE id = ?",[equip_id],function(err1,rows1){
                if(err1) throw err1;
                else{    
                    connection.query("SELECT name, mobile, email, address1,address2,address3, city, state, zipcode  FROM account WHERE id = ?",[rows1[0].owner_id],function(err3,rows3){
                            if (err3) throw err3;
                            else{ 
                                connection.query("SELECT * FROM equipment_type WHERE type_id = ?" ,[rows1[0].type_id], function(err4, rows4){
                                    if(err4) throw err4;
                                    else res.render('./user_request.ejs', {owner_details : rows3[0] , equip_data : rows1, featured:index_featured, tech_info : rows4[0] , isLoggedIn : isLoggedIn(req,res), username: req.session.name});    
                                });
                            }
                    });
                }    
            }); 
        }
        else{
            //query according to page
            res.send("requested..... aage k dekhte h");
        }
    },

    //divided in 3 qki async k pain aa rha tha
    my_requests1 : function(req,res, next){
        new_equip = [];
        used_equip = [];
        connection.query("SELECT equip_id FROM requests WHERE applicant_id = ?",[req.session.user],function(err,rows){
            if(err) throw err;
            else {
                for(var i =0 ; i <rows.length; i ++){
                    equip_id = rows[i].equip_id + '';
                    if(rows[i].equip_id[0] == 't'){
                        equip_id = equip_id.slice(1);
                        new_equip.push(equip_id);
                    }
                    else used_equip.push(equip_id);
                    if(i == (rows.length-1)) return next();
                }              
            }
        });
    },

    my_requests2 : function(req,res,next){
        if(new_equip.length){
            str = "SELECT subcategory, brand, model FROM equipment_type WHERE type_id IN (";
            for(var i = 0; i <new_equip.length; i++){
                equip_id = new_equip[i].slice(1);
                str = str + equip_id + ",";
            }
            str = str.slice(0,-1);
            str = str +")";
            connection.query(str, function(err2,rows2){
                if(err2) throw err2;
                else {
                    new_equip = rows2;
                    return next();
                }
            });
        }
        else return next();
    },

    my_requests3 : function(req,res){
        if(used_equip.length){
            str = "SELECT subcategory, brand, model FROM all_equipment WHERE id IN (";
            for(var i = 0; i <used_equip.length; i++){
                str = str + used_equip[i] + ",";
            }
            str = str.slice(0,-1);
            str = str +")";
            connection.query(str, function(err3,rows3){
                if(err3) throw err3;
                else {
                    used_equip = rows3;
                    return res.render("./user_requested.ejs", {new_equip: new_equip, used_equip: used_equip });
                }
            });
        }
        else return res.render("./user_requested.ejs", {new_equip: new_equip, used_equip:used_equip});      
    },

    get_reset_password : function(req,res){
        res.render("./user_reset_password.ejs", {msg:''});
    },

    post_reset_password : function(req,res, next){
        connection.query("SELECT password FROM account WHERE id = ?",[req.session.user], function(err,rows){
            if(err) throw(err);
            else{
                if(!bcrypt.compareSync(req.body.old_password, rows[0].password)) return res.render("./user_reset_password.ejs", {msg:'Old Password is incorrect'});
                if(req.body.new_password != req.body.retype_new_password) return res.render("./user_reset_password.ejs", {msg:'Passwords do not match'});
                else{
                   var new_password = bcrypt.hashSync(req.body.new_password, null, null);
                   connection.query("UPDATE account SET password = ? WHERE id = ?",[new_password,req.session.user], function(err,rows){
                    if(err) throw err;
                    else {
                        req.session.msg = "Password updated...";
                        return next();
                    }
                   });     
                }
            }
        });
    },

    check_profile: function(req,res, next){
        connection.query("SELECT country FROM account WHERE id = ?", [req.session.user], function(err,rows){
            if(err) throw err;
            if(rows[0].country) return next();
            else {
                connection.query("SELECT * FROM account WHERE id = ?" ,[req.session.user],function(err,rows){
                    if (err) throw err ;
                    else res.render('./user_update_profile.ejs' , {msg : "Please Update your Profile first." , user_data : rows[0], isLoggedIn : isLoggedIn(req,res), username: req.session.name});
                });
            }
        });
    },

    get_update_profile:  function(req, res){
        connection.query("SELECT * FROM account WHERE id = ?" ,[req.session.user],function(err,rows){
            if (err) throw err ;
            else res.render('./user_update_profile.ejs' , {msg : '' , user_data : rows[0], isLoggedIn:isLoggedIn(req,res), username: req.session.name});
        });
    },

    post_update_profile :  function(req, res){
        var updateQuery = "UPDATE account SET email = ?, address1 = ?,address2 = ?,address3 = ?, city = ?, state = ?, country = ?, zipcode = ? WHERE id =?";
        connection.query(updateQuery, [req.body.email, req.body.address1,req.body.address2,req.body.address3, req.body.city, req.body.state, 'India', req.body.zipcode, req.session.user],function (err, rows) {
            if (err) throw err;
            else {
                connection.query("SELECT * FROM account WHERE id = ?" ,[req.session.user],function(err1,rows1){
                    if (err) throw err ;
                    else res.render('./user_update_profile.ejs' , {msg : 'Profile Updated' , user_data : rows1[0], isLoggedIn : isLoggedIn(req,res), username: req.session.name});
                });          
            }
        });
    },

    get_update_this_equipment: function(req, res){
    connection.query("SELECT * FROM all_equipment WHERE id = ?" ,[req.params.id],function(err,rows){
            if (err) throw err;
            else res.render('./user_update_equipment.ejs' , {equip_data : rows[0], isLoggedIn : isLoggedIn(req,res), username: req.session.name});
        });
    },
    
    post_update_this_equipment: function(req, res, next){
        connection.query("SELECT photo1,photo2,photo3,photo4,doc_invoice,doc_insurance,doc_fitness,doc_rc,doc_poc,doc_roadtax FROM all_equipment WHERE id = ?", [req.params.id],function (err, rows) {
            if (err) throw err;
            else {
                var radicle = req.params.id;     
                var photo = [];
                var photoname = [];
                var resultp = [];
                var photo_name = [];
                
                photo[1] = req.files.photo1;
                photo[2] = req.files.photo2;
                photo[3] = req.files.photo3;
                photo[4] = req.files.photo4;
                var photovals = [rows[0].photo1, rows[0].photo2, rows[0].photo3,rows[0].photo4 ];

                for(var i = 1; i<5 ; i++){
                    if(photo[i]){
                        photoname[i] = photo[i].name;
                        resultp[i] = photoname[i].split('.');
                        photo_name[i] = radicle+'_'+i+'.'+resultp[i].slice(-1) ;
                        photo[i].mv('images/old/'+photo_name[i], function(err3){           
                            if (err3) throw(err3);
                        });
                    }
                    else photo_name[i] = photovals[i-1];
                }

                var doc = [];
                var docname = [];
                var resultd = [];
                var doc_name = [];
                var docvals = [rows[0].doc_invoice, rows[0].doc_insurance, rows[0].doc_fitness, rows[0].doc_rc, rows[0].doc_poc, rows[0].doc_roadtax];

                doc[1] = req.files.doc_invoice;
                doc[2] = req.files.doc_insurance;
                doc[3] = req.files.doc_fitness;
                doc[4] = req.files.doc_rc;
                doc[5] = req.files.doc_poc;
                doc[6] = req.files.doc_roadtax;

                for(var i = 1; i<7 ; i++){
                    if(doc[i]){
                        docname[i] = doc[i].name;
                        resultd[i] = docname[i].split('.');
                        doc_name[i] = radicle+'_'+i+'.'+resultd[i].slice(-1) ;
                        doc[i].mv('docs/old/'+doc_name[i] , function(err3){           
                            if (err3) throw(err3);
                        });
                    }
                    else doc_name[i] = docvals[i-1];
                } 
                    var insertQuery = "UPDATE all_equipment SET expected_price=?, km=?, description=? ,photo1 = ? , photo2 = ?, photo3 = ?, photo4 = ?, doc_invoice = ?, doc_insurance= ?, doc_fitness=?, doc_rc=?, doc_poc=?, doc_roadtax=? WHERE id = ?";
                    connection.query(insertQuery, [req.body.expected_price, req.body.km, req.body.description, photo_name[1],photo_name[2],photo_name[3],photo_name[4],doc_name[1],doc_name[2],doc_name[3],doc_name[4],doc_name[5],doc_name[6],req.params.id],function (err4, resulti){
                    if (err4) throw err4;
                    else {
                        req.session.msg = "Your equipment is added successfully...";
                        return next();
                    }
                });
            }
        });

    },

   
    my_equipment: function(req , res){
        connection.query("SELECT * FROM all_equipment WHERE owner_id = ?" ,[req.session.user],function(err,rows){
            if (err) throw err ; 
            else res.render('./user_view_equipment.ejs' , {datarows: rows, isLoggedIn : isLoggedIn(req,res), username: req.session.name});
        });
    },

    view_equipment:  function(req , res){
        connection.query("SELECT photo1, subcategory, brand, model,colour, expected_price, id  FROM all_equipment WHERE available = 1",function(err,rows){
            if (err) throw err ;
            else res.render('./user_view_equipment.ejs' , {datarows: rows, isLoggedIn : isLoggedIn(req,res), username: req.session.name});
        });
    },

    get_add_equipment: function(req,res){
        if(req.session.msg) {
                    msg = req.session.msg;
                    req.session.msg = '';
        }
        else msg = 'Please enter the following details';
        connection.query("SELECT DISTINCT subcategory FROM equipment_type WHERE category = ?",[cat_rows[0].category], function(err1, subcat_rows){
            if (err1) throw err1;
            else res.render('./user_add_equipment.ejs', {msg : msg, cat_rows:cat_rows, isLoggedIn : isLoggedIn(req,res), username: req.session.name});                             
        });
    },

    get_add_equipment_category: function(req,res){
    	var cat_selected = req.query.category;
		var sql="SELECT DISTINCT subcategory FROM equipment_type WHERE category = ?";
		connection.query(sql, [cat_selected], function(err,result){
			if(err){res.end('error');}
	        else{ 
	        	res.send(result);
	        } 
		}); 
	},

	get_add_equipment_subcategory: function(req,res){
    	var cat_selected = req.query.category;
    	var subcat_selected = req.query.subcategory;
		var sql="SELECT DISTINCT brand FROM equipment_type WHERE category = ? AND subcategory= ?";
		connection.query(sql, [cat_selected, subcat_selected], function(err,result){
			 if(err){res.end('error');}
	        else{ 
	        	res.send(result);} 
		}); 
	},

	get_add_equipment_brand: function(req,res){
    	var brand_selected = req.query.brand;
    	var cat_selected = req.query.category;
    	var subcat_selected = req.query.subcategory;
		var sql="SELECT DISTINCT model FROM equipment_type WHERE category = ? AND subcategory= ? AND brand= ?";
		connection.query(sql, [cat_selected, subcat_selected, brand_selected], function(err,result){
			 if(err){res.end('error');}
	        else{ 
	        	res.send(result);} 
		}); 
	},

    post_add_equipment: function(req, res, next){
        var name = {
                    category : req.body.category,
                    subcategory : req.body.subcategory,   
                    brand: req.body.brand,
                    model: req.body.model,
                    expected_price: req.body.expected_price,
				    year: req.body.year,
	                colour: req.body.colour,
				    description: req.body.description,
	                km: req.body.km,                 
                    available : 1,
                    type_id : 0,
                    owner_id: req.session.user,
                    city:'',
                    state:'',
                    uploaded_by : 0
        };   
        connection.query("SELECT type_id FROM equipment_type WHERE category = ? AND subcategory = ? AND brand = ? AND model = ?", [name.category, name.subcategory, name.brand, name.model], function(err, rows){
        	if(err) throw err;
        	else { 
        		name.type_id = rows[0].type_id;       
		        connection.query("SELECT name, city, state FROM account WHERE id = ?", [name.owner_id], function(err,rows){
		            if (err) throw err;
		            else {
		                name.city = rows[0].city;
		                name.state = rows[0].state;

		        var radicle = '';
		        connection.query("SELECT id FROM all_equipment ORDER BY id ASC", function(err,rows){
		        	if(err) throw err;
		        	else {
                        if(rows.length)	radicle = rows.slice(-1)[0].id + 1;
	                    else radicle = 1;
		        		
		        var photo = [];
		        var photoname = [];
		        var resultp = [];
		        var photo_name = [];
		        
		        photo[1] = req.files.photo1;
		        photo[2] = req.files.photo2;
		        photo[3] = req.files.photo3;
		        photo[4] = req.files.photo4;

		        for(var i = 1; i<5 ; i++){
		                photoname[i] = photo[i].name;
		                resultp[i] = photoname[i].split('.');
		                photo_name[i] = radicle+'_'+i+'.'+resultp[i].slice(-1) ;
		                photo[i].mv('images/old/'+photo_name[i], function(err3){           
		                    if (err3) throw(err3);
		                });
		        }

		        var doc = [];
		        var docname = [];
		        var resultd = [];
		        var doc_name = [];

		        doc[1] = req.files.doc_invoice;
                doc[2] = req.files.doc_insurance;
                doc[3] = req.files.doc_fitness;
                doc[4] = req.files.doc_rc;
                doc[5] = req.files.doc_poc;
                doc[6] = req.files.doc_roadtax;

		        for(var i = 1; i<7 ; i++){
		        	if(doc[i]){
		                docname[i] = doc[i].name;
		                resultd[i] = docname[i].split('.');
		                doc_name[i] = radicle+'_'+i+'.'+resultd[i].slice(-1) ;
		                doc[i].mv('docs/old/'+doc_name[i] , function(err3){           
		                    if (err3) throw(err3);
		                });
		           	}
		           	else doc_name[i] = '';
		        }

		        var insertQuery = "INSERT INTO all_equipment (uploaded_by, photo1, photo2, photo3, photo4, doc_invoice, doc_insurance, doc_fitness, doc_rc, doc_poc, doc_roadtax ,type_id,state,available, category , brand, model, expected_price, year, colour, city, subcategory, description, km, owner_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		        connection.query(insertQuery, [name.uploaded_by, photo_name[1],photo_name[2],photo_name[3],photo_name[4],doc_name[1],doc_name[2],doc_name[3],doc_name[4],doc_name[5],doc_name[6],name.type_id, name.state, name.available, name.category,name.brand, name.model, name.expected_price, name.year, name.colour, name.city, name.subcategory, name.description,name.km,name.owner_id],function (err4, resulti){
		            if (err4) throw err4;
		            else {
                        req.session.msg = "Your equipment is added successfully...";
                        return next();
                    }
		        });

		        	}
		        });
		        	}
		        });	
		    }
		});        
    }   
}
