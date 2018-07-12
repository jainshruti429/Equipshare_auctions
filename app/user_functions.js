
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

// var isLoggedIn = function(req, res) {  
//         var x ;
//         if (req.isAuthenticated()) x=1;
//         else x = 0;
//         return x;
//     };

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

    home: function(req, res) {  
        connection.query("SELECT DISTINCT category FROM equipment_type", function(errc,crows){
            if(errc) throw errc;
            else {
                connection.query("SELECT DISTINCT subcategory FROM equipment_type WHERE category = ?",[crows[0].category], function(err2, rows2){
                    if(err2) throw err2;
                    else {
                        connection.query("SELECT all_equipment.photo1, all_equipment.expected_price, all_equipment.subcategory,all_equipment.category, all_equipment.brand, all_equipment.model, all_equipment.id FROM all_equipment INNER JOIN featured ON featured.equip_id = all_equipment.id WHERE featured.display = 1",function(errf,featured){
                            if(errf) throw errf;
                            else res.render("./user_index.ejs", {featured :featured, cat_rows:crows, subcat_rows: rows2, selected : '', username : req.session.name});
                                    

                                  });
                            }
                    });
            }
        });
    },        
       
    // featured: function(req,res){
    //     connection.query("SELECT views FROM featured WHERE equip_id = ?",[req.params.id],function(err,rows){
    //         if(err) throw err;
    //         else {
    //             var views = rows[0].views + 1;
    //             connection.query("UPDATE featured SET views = ? WHERE equip_id = ?",[views, req.params.id],function(err1,rows1){
    //                 if(err1) throw err1;
    //                 else{
    //                     connection.query("SELECT * FROM all_equipment WHERE id = ?",[req.params.id], function(err2, rows2){
    //                         if(err2) throw err2;
    //                         else {
    //                             request = 1;
    //                             connection.query("SELECT * FROM equipment_type WHERE type_id = ?" ,[rows2[0].type_id], function(err4, rows4){
    //                                 if(err4) throw err4;
    //                                 else res.render('./user_view.ejs', {equip_data : rows2, featured:index_featured, tech_info : rows4[0], request:request, isLoggedIn : isLoggedIn(req,res), username: req.session.name});                            
    //                             });
    //                         }       
    //                     });       
    //                 }
    //             });
    //         }
    //     });
    // },

    search_category : function(req,res){
        var cat_selected = req.query.category;
        var sql="SELECT DISTINCT subcategory FROM equipment_type WHERE category = ?";
        connection.query(sql, [cat_selected], function(err,result){
            if(err) throw err;
            else res.send(result);
        });  
    },

    //---------SORT OF AN EQUIPMENT---------------------------------------
    //          0 = NEW
    //          1 = USED
    //-------------------------------------------------------------------     
    search: function(req,res){
        var subcategory, sort;
        if(req.subcategory){
            subcategory = req.subcategory;
            sort = req.sort;
            req.subcategory = "";
            req.sort = "";
        }
        else {
            subcategory = req.body.subcategory;
            sort = req.body.sort;
        }
        var query = '';
        if(sort == "new") query = "SELECT * FROM equipment_type WHERE subcategory = ?"
        else query = "SELECT * FROM all_equipment WHERE available = 1 AND subcategory = ?"
        connection.query(query ,[subcategory],function(err,rows){
            if(err) throw err;
            else res.render("" , {datarows: rows, username: req.session.name});  
        });
    },

    compare_now : function(req,res){
        if(req.session.compare){
            compare = req.session.compare
            str = "SELECT * FROM equipment_type WHERE type_id IN (";
            str1 = '';    
            for(var i = 0; i <compare.length; i++){
                str1 = str1 + compare[i] + ",";
            }
            str1 = str1.slice(0,-1);
            str = str +str1+")";
            connection.query(str, function(err,rows){
                if(err) throw err;
                else {
                    str2 = "INSERT INTO compares VALUES ";
                    for(var i = 0 ; i <compare.length; i ++){
                        str2 = str2 + "("+ compare[i] +","+ req.session.user+"),";
                    }
                    str2 = str2.slice(0,-1);
                    connection.query(str2, function(err1){
                        if (err) throw err;
                        else return res.send(rows);
                    });
                } 
            });
        }
        else res.send();
    },

    //change and break into two functions
    compare :function(req,res){
        if(!req.session.compare) req.session.compare = []; 
        compare = req.session.compare
        if(compare.length>4) return res.send(); //send a msg or something
        id = req.query.id;
        for(var i = 0; i< compare.length; i++){
            if(compare[i] == id){
                compare.splice(i,1);
                return res.send(compare);
            }
        }
        compare.push(req.query.id);
        req.session.compare = compare;
        return res.send(compare);
    },

    saved_searches : function(req,res){
        connection.query("SELECT * FROM save WHERE user_id = ? ORDER BY display" , [req.session.user],function(err,rows){
            if(err) throw err;
            else res.render("./user_saved_searches.ejs", {datarows:rows});
        });
    },

    //TBD because of filters
    save_search : function(req,res){
        connection.query("INSERT INTO save (user_id, date,subcategory, sort, display) VALUES (?,current_timestamp(),?,?,?)", [req.session.user, req.body.subcategory, req.body.sort, 1], function(err,rows){
            if(err) throw err;
            else return res.send("ho gaya"); //msg send karna h
        });
    },    

    delete_this_search : function(req,res, next){
        connection.query("UPDATE save set display = 0 WHERE save_id = ?",[req.params.save_id], function(err){
            if(err) throw err;
            else next();
        });
    },

    go_to_this_search : function(req,res,next){
        connection.query("SELECT subcategory, sort FROM save WHERE save_id = ?", [req.params.save_id], function(err,rows){
            if(err) throw err;
            else{
                req.subcategory = rows[0].subcategory;
                req.sort = rows[0].sort;
                return next();
            }
        });
    },

    //TBD
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
                            else{
                                //send to requests page or msg = "Our team will soon contact you!" or both
                            }
                        });
                    }
                });
            //}
        }
        // if(equip_id[0]!= 't'){
        //     connection.query("SELECT * FROM all_equipment WHERE id = ?",[equip_id],function(err1,rows1){
        //         if(err1) throw err1;
        //         else{    
        //             connection.query("SELECT name, mobile, email, address1,address2,address3, city, state, zipcode  FROM account WHERE id = ?",[rows1[0].owner_id],function(err3,rows3){
        //                     if (err3) throw err3;
        //                     else{ 
        //                         connection.query("SELECT * FROM equipment_type WHERE type_id = ?" ,[rows1[0].type_id], function(err4, rows4){
        //                             if(err4) throw err4;
        //                             else res.render('./user_request.ejs', {owner_details : rows3[0] , equip_data : rows1, featured:index_featured, tech_info : rows4[0] , isLoggedIn : isLoggedIn(req,res), username: req.session.name});    
        //                         });
        //                     }
        //             });
        //         }    
        //     }); 
        // }
        // else{
        //     //query according to page
        //     res.send("requested..... aage k dekhte h");
        // }
    },

    //divided in 4 qki async k pain aa rha tha
    //---------STATUS OF A REQUEST---------------------------------------
    //          0 = Pending
    //          1 = not now (faltu request thi)
    //          2 = interested(send to company and financer)
    //          3 = sold
    //          4 = rejected     
    //-------------------------------------------------------------------     
    my_requests0:function(req,res,next){
        req.user_id = req.session.user;
        return next();
    },

    my_requests1 : function(req,res, next){
        new_equip = [];
        used_equip = [];
        interested = [];
        connection.query("SELECT * FROM requests WHERE applicant_id = ?",[req.user_id],function(err,rows){
            if(err) throw err;
            else {
                for(var i =0 ; i <rows.length; i ++){
                    equip_id = rows[i].equip_id + '';
                    if(rows[i].equip_id[0] == 't'){
                        equip_id = equip_id.slice(1);
                        new_equip.push(equip_id);
                    }
                    else used_equip.push(equip_id);
                    if(rows[i].status ==2) interested.push(rows[i].sno)
                    if(i == (rows.length-1)) {
                        req.new_equip = new_equip;
                        req.used_equip = used_equip;
                        req.interested = interested;
                        return next();}
                }              
            }
        });
    },

    //sort new equipments
    my_requests2 : function(req,res,next){
        if(req.new_equip.length){
            new_equip = req.new_equip;
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
                    req.new_equip = rows2;
                    return next();
                }
            });
        }
        else return next();
    },

    //sort old equipments
    my_requests3 : function(req,res,next){
        if(req.used_equip.length){
            used_equip = req.used_equip;
            str = "SELECT subcategory, brand, model FROM all_equipment WHERE id IN (";
            for(var i = 0; i <used_equip.length; i++){
                str = str + used_equip[i] + ",";
            }
            str = str.slice(0,-1);
            str = str +")";
            connection.query(str, function(err3,rows3){
                if(err3) throw err3;
                else {
                    req.used_equip = rows3;
                    return next();
                }
            });
        }
        else return next();
    },

    //---------STATUS OF A Proposal---------------------------------------
    //          0 = Pending
    //          1 = Accept
    //          2 = reject    
    //-------------------------------------------------------------------     
    //proposals
    my_requests4 : function(req,res){
        if(req.interested.length){
            interested = req.interested
            str = "SELECT * FROM proposals WHERE request_sno IN (";
            for(var i = 0; i <interested.length; i++){
                str = str + interested[i] + ",";
            }
            str = str.slice(0,-1);
            str = str +") ORDER BY proposals.status";
            connection.query(str, function(err3,rows3){
                if(err3) throw err3;
                else{
                    req.proposals = rows3;
                    return next();
                }          
            });
        }
        else{
            req.proposals = [];
            return next();
        } 
    },

    my_requests5: function(req,res){
        res.render("./user_requested.ejs", {new_equip: req.new_equip, used_equip: req.used_equip, proposals:req.proposals, username:req.session.name});
    },

    change_proposal_status: function(req,res){
        connection.query("UPDATE proposals SET status = ?, reply = ? , date_replied = current_timestamp() WHERE request_sno = ?",[req.body.status,req.body.reply,req.params.sno],function(req,res){
            if(err) throw err;
            else {//TBD
                msg = "";
                res.send(msg);
            }
        });
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
            else res.render('./user_update_profile.ejs' , {msg : '' , user_data : rows[0], username: req.session.name});
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
    
    //---------STATUS of an Equipment---------------------------------------
    //          0 = In use
    //          1 = Sell Now
    //          2 = Auction
    //          3 = Make Offer
    //          4 = Sold    
    //-----------------------------------------------------------------------
    //TBD     
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
                    var insertQuery = "UPDATE all_equipment SET status = ?, expected_price=?, km=?, description=? ,photo1 = ? , photo2 = ?, photo3 = ?, photo4 = ?, doc_invoice = ?, doc_insurance= ?, doc_fitness=?, doc_rc=?, doc_poc=?, doc_roadtax=? WHERE id = ?";
                    connection.query(insertQuery, [req.body.status, req.body.expected_price, req.body.km, req.body.description, photo_name[1],photo_name[2],photo_name[3],photo_name[4],doc_name[1],doc_name[2],doc_name[3],doc_name[4],doc_name[5],doc_name[6],req.params.id],function (err4, resulti){
                    if (err4) throw err4;
                    else {
                        req.session.msg = "Your equipment is added successfully...";
                        return next();
                    }
                });
            }
        });

    },
   
    my_equipment1: function(req , res, next){
        connection.query("SELECT id, category AS Category, subcategory AS Subcategory, brand AS Brand, model AS Model, status AS Status FROM all_equipment WHERE owner_id = ? ORDER BY id" ,[req.session.user],function(err,rows, fields){
            if (err) throw err ; 
            else {
                req.datarows = rows;
                req.fields = fields;
                return next();
            }
        });
    },

    my_equipment2: function(req,res){
        res.render("./table.ejs", {datarows:req.datarows, username:req.session.name});
    },

    // view_equipment:  function(req , res){
    //     connection.query("SELECT photo1, subcategory, brand, model,colour, expected_price, id  FROM all_equipment WHERE available = 1",function(err,rows){
    //         if (err) throw err ;
    //         else res.render('./user_view_equipment.ejs' , {datarows: rows, isLoggedIn : isLoggedIn(req,res), username: req.session.name});
    //     });
    // },

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

    //TBD because of status
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
    },

    //TBD
    //===========================AUCTION API'S==================================================

    upcoming_auctions : function(req,res){
        connection.query("SELECT * FROM auctions WHERE start_date > current_timestamp()", function(err,rows){
            if(err) throw err;
            else res.send("ho gaya");
        });
    },

    my_auction_requests : function(req,res){
        connection.query("SELECT auctions.auction_id, auctions.name, auctions.start_date, auctions.end_date, auction_requests.request_status FROM auctions INNER JOIN auction_requests ON auction_requests.auction_id = auctions.auction_id WHERE auction_requests.user_id = ? ORDER BY start_date DESC", [req.session.user],function(err,rows){
            if(err) throw err;
            else res.send("lo ho gaya");
        });
    },

    ongoing_auction : function(req,res){
        connection.query("SELECT auctions.auction_id, auction.name, auctions.start_date, auctions.end_date, auction_requests.request_status FROM auctions INNER JOIN auction_requests ON auction_requests.auction_id = auctions.auction_id WHERE auctions.start_date < current_timestamp AND auctions.end_date > current_timestamp AND auction_requests.user_id = ?",[req.session.user], function(err, rows){
            if(err) throw err;
            else if(rows.length){
                if(rows[0].request_status){
                    connection.query("SELECT all_equipment.id, all_equipment.brand, all_equipment.model, auction_equipment.current_bid, auction_equipment.base_price FROM all_equipment INNER JOIN auction_equipment ON auction_equipment.equip_id = all_equipment.id WHERE auction_equipment.auction_id = ?",[rows[0].auction_id],function(err1,rows1){
                        if(err1) throw err1;
                        else {
                            connection.query("SELECT equip_id, count(equip_id) as no_bids FROM bids WHERE auction_id = ?",[rows[0].auction_id], function(err2,rows2){
                                if(err2) throw err2;
                                else {
                                    var no_bids = [];
                                    for(var i =0; i<rows1.length; i++){
                                        no_bids[i] = 0;

                                        for(var j = 0 ; j <rows2.length; j++){
                                            if(rows1[i].id == rows2[j].equip_id){
                                                no_bids[i] = rows1[j].no_bids;
                                                break;
                                            }
                                        }
                                    }
                                    res.send(rows1, no_bids);
                                }
                            });
                        }
                    });
                }
            }
            else next();//upcoming auctions
        });
    },

    add_bid: function(req, res){
        connection.query("SELECT current_bid, base_price FROM auction_equipment WHERE equip_id=? AND auction_id=?",[req.params.auction_id, req.params.equip_id],function(err1,rows1){
            if(err1) throw err1;
            else if(rows1.length){
                    if(req.body.bid_amount > rows1[0].current_bid) return next(); // insert_bid
                    else res.send("You need to bid higher than the current bid");
                }
            else return next();
        });
    },
    
    insert_bid: function(req,res){
        var equip_id = req.params.equip_id;
        var auction_id = req.params.auction_id;
        var user_id = req.session.user;
        var bid_amount = req.body.bid_amount;   
        insertQuery = "INSERT INTO bids (equip_id, auction_id, user_id, bid_amount, time) values (?,?,?,?, current_timestamp())";
        connection.query(insertQuery, [equip_id, auction_id, user_id, bid_amount], function(err1){
            if(err1) throw err1;
            else{
                updatequery = "UPDATE auction_equipment SET current_bid = ? WHERE equip_id = ? AND auction_id = ?";
                connection.query(updatequery, [bid_amount, equip_id, auction_id], function(err){
                    if(err) throw err;
                    else{
                    res.send({msg: "Your bid is recorded"});
                    }
                });
            }
        });
    },
    
}
