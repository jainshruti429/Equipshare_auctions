// Admin routes functions


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

// ================== DAILY AUCTION TIME ===================

var DAST = "15:00:00";
var DAET = "20:00:00";

// =========================================================

module.exports = {

//================================================================================
//======================= ADMIN FUNCTIONS ========================================
//================================================================================
    //get_login and post_login in routes page...passport k pain tha
  
//-----------------------------------generic website funtions -------------------------------------------

   //enquiry info to admin (admin_inquiry.ejs is to be designed)
    inEmail : function(req, res){
        connection.query("SELECT * FROM enquiry WHERE status = 0",function(err,rows){
            if(err) throw err;
            else {
                connection.query("SELECT * FROM enquiry WHERE status = 1",function(err1,rows1){
                    if(err1) throw err1;
                    else res.render('./admin_inquiry.ejs',{current:rows , previous: rows1, username:req.session.name});
                });
            }
        });
    },
//-----------------------------------generic website function ends here-------------------------------
    saved_searches : function(req,res){
        connection.query("SELECT * FROM save", function(err,rows){
            if(err) throw err;
            else res.send(rows);
        });    
    },

    show_requests: function(req,res){
        connection.query("SELECT * FROM requests ORDER BY status", function(err,rows){
            if(err) throw err;
            else res.send(rows);
        });
    },

    change_status : function(req,res){ //TBD
        connection.query("UPDATE ? SET status = ? WHERE sno = ?",[req.query.table, req.body.status, req.params.sno],function(err,rows){
            if(err) throw err;
            else res.send("lo ho gaya......");
        });
    },

    comment : function(req,res,next){ //TBD
        connection.query("UPDATE ? SET comment = ? WHERE sno = ?", [req.query.table,req.body.comment,req.params.sno], function(err){
            if(err) throw err;
            else return next();
        });
    },

    

    feat_data : function(req,res,next){
        feat_data = [];
        str1 = "SELECT views.equip_id, count(views.equip_id) as no_views FROM views INNER JOIN featured ON featured.equip_id = views.equip_id WHERE featured.display = 1 GROUP BY views.equip_id";
        connection.query(str1, function(err1,rows1){
            if(err1) throw err1;
            else{
                str2 = "SELECT requests.equip_id, count(requests.equip_id) as no_requests FROM requests INNER JOIN featured ON featured.equip_id = requests.equip_id WHERE featured.display = 1 GROUP BY requests.equip_id";
                connection.query(str2, function(err2,rows2){
                    if(err2) throw err2;
                    else{
                        for(var i =0; i<featured.length; i++){
                            feat_data[i] = {
                                views : '',
                                requests: ''
                            }

                            for(var j = 0 ; j <rows1.length; j++){
                                if(featured[i].equip_id == rows1[j].equip_id){
                                    feat_data[i].views = rows1[j].no_views;
                                    break;
                                }
                            }
                            if(!feat_data[i].views) feat_data[i].views = 0;
                            
                            for(var j = 0 ; j <rows2.length; j++){
                                if(featured[i].equip_id == rows2[j].equip_id){
                                    feat_data[i].requests = rows2[j].no_requests;
                                    break;
                                }
                            }
                            if(!feat_data[i].requests) feat_data[i].requests = 0;
                        }
                        return next();
                    }
                });
            }
        });
    },

    available : function(req,res,next){
        datarows = [];
        data = [];
        str = "SELECT all_equipment.id,all_equipment.available, all_equipment.category, all_equipment.subcategory, all_equipment.brand, all_equipment.model,all_equipment.expected_price,account.name, account.address1, account.address2, account.address3, account.city, account.state, account.zipcode, account.email, account.mobile FROM account INNER JOIN all_equipment ON all_equipment.owner_id = account.id WHERE available = 1"
        connection.query(str,function(err, rows){
            if (err) throw err;
            else{
                var str = "SELECT views.equip_id, count(views.equip_id) as no_views FROM views INNER JOIN all_equipment ON all_equipment.id = views.equip_id WHERE all_equipment.available = 1 GROUP BY views.equip_id";
                connection.query(str, function(err1,rows1){
                    if(err1) throw err1;
                    else{
                        str = "SELECT requests.equip_id, count(requests.equip_id) as no_requests FROM requests INNER JOIN all_equipment ON all_equipment.id = requests.equip_id WHERE all_equipment.available = 1 GROUP BY requests.equip_id";
                        connection.query(str, function(err2,rows2){
                            if(err2) throw err2;
                            else{
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
                                datarows = rows;
                                return next();    
                            }
                        });
                    }
                });
            }
        });
    },

    featured_equip : function(req,res, next){
        featured = [];
        prev_featured = [];
        feat_details = [];
        str1 = "SELECT featured.equip_id,featured.views, featured.start_date, featured.end_date, featured.display,all_equipment.photo1, all_equipment.expected_price, all_equipment.subcategory, all_equipment.brand, all_equipment.model, all_equipment.owner_id FROM all_equipment INNER JOIN featured ON featured.equip_id = all_equipment.id";
        connection.query(str1, function(err,rows){
            if(err) throw err;
            else{
                for(var i = 0; i<rows.length; i++){
                    if(rows[i].display) featured.push(rows[i]);
                    else prev_featured[k] = rows[i];
                }
                str = "SELECT name, address1, address2, address3, city, state, zipcode, mobile FROM account WHERE id IN (";
                for(var i = 0; i <featured.length; i++){
                    str = str + featured[i].owner_id + ",";
                }
                str = str.slice(0,-1);
                str = str +")";
                connection.query(str, function(err2,rows2){
                    if(err2) throw err2;
                    else{
                        if(rows2.length == featured.length) feat_details = rows2;
                        else if(rows2.length == 1){
                             for(var i = 0 ; i < 3 ; i++){
                                feat_details[i] = rows2[0];
                            }
                        } 
                        else{
                            if(featured[0].owner_id == featured[1].owner_id){
                                feat_details[0] = rows2[0];
                                feat_details[1] = rows2[0];
                                feat_details[2] = rows2[1];
                            }
                            if(featured[1].owner_id == featured[2].owner_id){
                                feat_details[0] = rows2[0];
                                feat_details[1] = rows2[1];
                                feat_details[2] = rows2[1];   
                            }
                            if(featured[0].owner_id == featured[2].owner_id){
                                feat_details[0] = rows2[0];
                                feat_details[1] = rows2[1];
                                feat_details[2] = rows2[0];   
                            }
                        }
                        return next();
                    }
                });
            }
        });
    },
  
    featured: function(req,res){
        res.render('./admin_featured.ejs' , {featured: featured, feat_details:feat_details, prev_featured : prev_featured, feat_data: feat_data, username:req.session.name});                
    },

    remove_featured: function(req,res,next){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) dd = '0'+dd;
        if(mm<10) mm = '0'+mm; 
        today = dd + '/' + mm + '/' + yyyy;

        connection.query("UPDATE featured SET display = 0, end_date =? WHERE equip_id = ?",[today,req.params.id],function(err){
            if(err) throw err;
            else next();
        });
    },

    get_add_featured: function(req,res){
        if(featured.length < 3) res.render("./admin_add_featured.ejs", {featured:featured , feat_data:feat_data, feat_details:feat_details, datarows:datarows, data:data, username:req.session.name});
        else res.render('./admin_featured.ejs' , {featured: featured, feat_details:feat_details, prev_featured : prev_featured, feat_data: feat_data, username:req.session.name});                 
    },

    post_add_featured: function(req,res, next){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) dd = '0'+dd;
        if(mm<10) mm = '0'+mm; 
        today = dd + '/' + mm + '/' + yyyy;

        connection.query('SELECT * FROM featured WHERE equip_id=? and display = 1',[req.params.id],function(err1,rows1){
            if(err1) throw err1;
            else if(rows1.length) return next();
            else{
                connection.query("INSERT INTO featured (equip_id,display,start_date, views, end_date) VALUES (?,?,?,?,?)",[req.params.id,1,today,0, 0], function(err){
                    if (err) throw err;
                    else return next();
                });
            }
        });
    },

    view_equipment_type : function(req,res){
        connection.query("SELECT subcategory, brand, model FROM equipment_type", function(err, rows){
            if(err) throw err;
            else res.send(rows);
        });
    },    

    view_equipment: function(req , res){
        req.session.title = "Available Equipments";
        res.render("./admin_view_equipment.ejs", { title : req.session.title, datarows:datarows, data:data, username:req.session.name});
    },

    view_all_equipments: function(req , res){
        str4 = "SELECT all_equipment.id,all_equipment.available, all_equipment.category, all_equipment.subcategory, all_equipment.brand, all_equipment.model,all_equipment.expected_price,account.name, account.address1, account.address2, account.address3, account.city, account.state, account.zipcode, account.email, account.mobile FROM account INNER JOIN all_equipment ON all_equipment.owner_id = account.id"
        connection.query(str4,function(err, rows){
            if (err) throw err;
            else{
                var str4 = "SELECT views.equip_id, count(views.equip_id) as no_views FROM views INNER JOIN all_equipment ON all_equipment.id = views.equip_id WHERE all_equipment.available = 0 GROUP BY views.equip_id";
                connection.query(str4, function(err1,rows1){
                    if(err1) throw err1;
                    else{
                        str4 = "SELECT requests.equip_id, count(requests.equip_id) as no_requests FROM requests INNER JOIN all_equipment ON all_equipment.id = requests.equip_id WHERE all_equipment.available = 0 GROUP BY requests.equip_id";
                        connection.query(str4, function(err2,rows2){
                            if(err2) throw err2;
                            else{
                                var info = [];
                                for(var i =0; i<rows.length; i++){
                                    info[i] = {
                                        views : '',
                                        requests: ''
                                    }

                                    for(var j = 0 ; j <rows1.length; j++){
                                        if(rows[i].id == rows1[j].equip_id){
                                            info[i].views = rows1[j].no_views;
                                            break;
                                        }
                                    }
                                    if(!info[i].views) info[i].views = 0;
                                    
                                    for(var j = 0 ; j <rows2.length; j++){
                                        if(rows[i].id == rows2[j].equip_id){
                                            info[i].requests = rows2[j].no_requests;
                                            break;
                                        }
                                    }
                                    if(!info[i].requests) info[i].requests = 0;
                                }
                                req.session.title = "All Equipments"; 
                                res.render("./admin_view_equipment.ejs", {title : req.session.title,datarows:rows, data:info, username:req.session.name});
                            }
                        });
                    }
                });
            }
        });
    },

    my_equipment: function(req , res){
        str4 = "SELECT all_equipment.id,all_equipment.available, all_equipment.category, all_equipment.subcategory, all_equipment.brand, all_equipment.model,all_equipment.expected_price,account.name, account.address1, account.address2, account.address3, account.city, account.state, account.zipcode, account.email, account.mobile FROM account INNER JOIN all_equipment ON all_equipment.owner_id = account.id WHERE all_equipment.owner_id = ? OR all_equipment.uploaded_by = 1"
        connection.query(str4, [req.session.user] , function(err, rows){
            if (err) throw err;
            else{
                var str4 = "SELECT views.equip_id, count(views.equip_id) as no_views FROM views INNER JOIN all_equipment ON all_equipment.id = views.equip_id WHERE all_equipment.available = 0 GROUP BY views.equip_id";
                connection.query(str4, function(err1,rows1){
                    if(err1) throw err1;
                    else{
                        str4 = "SELECT requests.equip_id, count(requests.equip_id) as no_requests FROM requests INNER JOIN all_equipment ON all_equipment.id = requests.equip_id WHERE all_equipment.available = 0 GROUP BY requests.equip_id";
                        connection.query(str4, function(err2,rows2){
                            if(err2) throw err2;
                            else{
                                var info = [];
                                for(var i =0; i<rows.length; i++){
                                    info[i] = {
                                        views : '',
                                        requests: ''
                                    }

                                    for(var j = 0 ; j <rows1.length; j++){
                                        if(rows[i].id == rows1[j].equip_id){
                                            info[i].views = rows1[j].no_views;
                                            break;
                                        }
                                    }
                                    if(!info[i].views) info[i].views = 0;
                                    
                                    for(var j = 0 ; j <rows2.length; j++){
                                        if(rows[i].id == rows2[j].equip_id){
                                            info[i].requests = rows2[j].no_requests;
                                            break;
                                        }
                                    }
                                    if(!info[i].requests) info[i].requests = 0;
                                } 
                                req.session.title = "My Equipments"
                                res.render("./admin_view_equipment.ejs", {title : req.session.title,datarows:rows, data:info, username:req.session.name});
                            }
                        });
                    }
                });
            }
        });
    },


    get_reset_password : function(req,res){
        res.render("./admin_reset_password.ejs", {msg:'', username:req.session.name});
    },

    post_reset_password : function(req,res, next){
        connection.query("SELECT password FROM account WHERE id = ?",[req.session.user], function(err,rows){
            if(err) throw(err);
            else{
                if(!bcrypt.compareSync(req.body.old_password, rows[0].password)) return res.render("./admin_reset_password.ejs", {msg:'Old Password is incorrect', username:req.session.name});
                if(req.body.new_password != req.body.retype_new_password) return res.render("./admin_reset_password.ejs", {msg:'Passwords do not match', username:req.session.name});
                else{
                   var new_password = bcrypt.hashSync(req.body.new_password, null, null);
                   connection.query("UPDATE account SET password = ? WHERE id = ?",[new_password,req.session.user], function(err,rows){
                    if(err) throw err;
                    else next();
                   });     
                }
            }
        });
    },

    get_update_this_equipment: function(req, res){
    connection.query("SELECT * FROM all_equipment WHERE id = ?" ,[req.params.id],function(err,rows){
            if (err) throw err;
            else res.render('./admin_update_equipment.ejs' , {equip_data : rows[0], username: req.session.name});
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
    
    inquiry : function(req, res){
        connection.query("SELECT * FROM emails WHERE resolved = 0",function(err,rows){
            if(err) throw err;
            else {
                connection.query("SELECT * FROM emails WHERE resolved = 1",function(err1,rows1){
                    if(err1) throw err1;
                    else res.render('./admin_inquiry.ejs',{current:rows , previous: rows1, username:req.session.name});
                });
            }
        });
    },

    
    // get_add_new_admin: function(req,res){
    //  res.render('./Profiles/admin/add_new_admin.ejs', {msg: 'Enter the following details' , username:req.session.name});
    // },

    // post_add_new_admin: function(req,res){
    //  if(req.body.password == req.body.retype_password){
    //     connection.query("SELECT * FROM account WHERE name = ?",[req.body.name], function(err, rows) {
    //         if (err) throw err;
    //         if (rows.length) res.render('./Profiles/admin/add_new_admin.ejs', {msg: 'That name is already taken' });
    //         else {
    //             // insert data into account table
    //             var newAdmin = {
    //                     name: req.body.name,
    //                     password: bcrypt.hashSync(req.body.password, null, null),  // use the generateHash function in our user model
    //                     category: 0,
    //                     email: req.body.email,
    //                     mobile: req.body.mobile
    //                 };
    //             var insertQuery1 = "INSERT INTO account ( name, email, mobile, category, password) values (?,?,?,?,?)";
    //             connection.query(insertQuery1,[newAdmin.name, newAdmin.email, newAdmin.mobile,newAdmin.category,newAdmin.password,], function(err) {
    //                 if (err) throw err;
    //              else res.render('./Profiles/admin/homepage.ejs' ,{msg:'Admin '+req.body.name+ ' added'});
       //          });
    //         }
    //     });
    //     }
    //     else res.render('./Profiles/admin/add_new_admin.ejs', {msg:'Passwords do not match'});
    // },

    home:function(req, res) {
        res.render('./admin_index.ejs', {username : req.session.name});
    },
    
    get_equipment_type_csv : function(req,res){
        req.session.title = "Equipment Type";
        res.render("admin_upload_csv.ejs", {what:req.session.title, username : req.session.name, img_name : 'type_csv_format.png'});
    },

    get_equipment_csv : function(req,res){
        req.session.title = " New Equipment";
        res.render("admin_upload_csv.ejs", {what:req.session.title, username : req.session.name, img_name: 'equipment_csv_format.png'});
    },

    get_add_equipment_type : function(req,res){
        res.render('./admin_add_equipment_type.ejs', {username:req.session.name});
    },

    post_add_equipment_type :  function(req,res, next){
        connection.query("SELECT id FROM all_equipment WHERE category = ? AND subcategory = ? AND brand = ? AND model = ?", [req.body.category,req.body.subcategory,req.body.brand,req.body.model], function(err,rows){
            if (err) throw err;
            else if(rows.length) return next();
            else{    
                var radicle = '';
                connection.query("SELECT id FROM all_equipment ORDER BY id ASC", function(err,rows){
                    if(err) throw err;
                    else {
                        if(rows.length) radicle = rows.slice(-1)[0].id + 1;
                        else radicle = 1;

                        radicle = "t" + radicle;
                        var doc = [];
                        var docname = [];
                        var resultd = [];
                        var doc_name = [];

                        doc[1] = req.files.doc1;
                        doc[2] = req.files.doc2;
                        
                        for(var i = 1; i<3 ; i++){
                            if(doc[i]){
                                docname[i] = doc[i].name;
                                resultd[i] = docname[i].split('.');
                                doc_name[i] = radicle+'_'+i+'.'+resultd[i].slice(-1) ;
                                doc[i].mv('docs/new/'+doc_name[i] , function(err3){           
                                    if (err3) throw(err3);
                                });
                            }
                            else doc_name[i] = '';
                        }

                        var insertQuery = "INSERT INTO equipment_type (category, subcategory, brand,model,mapping_unit, max_dig_depth, engine_power, loader_capacity, showel_capacity, backhoe_bucket_capacity,weight, blade_capacity, doc1,doc2 ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                        connection.query(insertQuery,[req.body.category, req.body.subcategory, req.body.brand,req.body.model,req.body.mapping_unit, req.body.max_dig_depth, req.body.engine_power, req.body.loader_capacity, req.body.showel_capacity, req.body.backhoe_bucket_capacity,req.body.weight, req.body.blade_capacity, doc_name[1],doc_name[2]],function(err){ 
                                if (err) throw err;
                                else next();
                        });
                    }
                });
            }
        });
    },          
    
    views:  function(req, res){    
        connection.query("SELECT * FROM views WHERE equip_id = ?",[req.params.equip_id], function(err,rows){
            if (err) throw err;
            else if(rows.length){
                var str = "SELECT * FROM account WHERE id IN ( ";
                for(var i = 0; i< rows.length; i++){
                    str= str + rows[i].viewer_id + ",";
                }
                str = str.slice(0,-1);
                str = str +")";
                connection.query(str, function(err1, row1){
                    if(err1) throw err1;
                    else res.render("./admin_view_table.ejs", {datarows:row1, username:req.session.name});
                });
            }
            else res.render("./admin_view_table.ejs", {datarows:[], username:req.session.name});
        });
    },

    requests : function(req, res){
         connection.query("SELECT * FROM requests WHERE equip_id = ?",[req.params.equip_id], function(err,rows){
            if (err) throw err;
            else if(rows.length){
                var str = "SELECT * FROM account WHERE id IN ( ";
                for(var i = 0; i< rows.length; i++){
                    str= str + rows[i].applicant_id + ",";
                }
                str = str.slice(0,-1);
                str = str +")";
                connection.query(str, function(err1, row1){
                    if(err1) throw err1;
                    else {
                        console.log(row1);
                        res.render("./admin_request_table.ejs", {datarows:row1, username:req.session.name});
                                    }});
            }
            else res.render("./admin_request_table.ejs", {datarows:[], username:req.session.name});
        });
    },
    
    unavailable: function(req,res, next){
        connection.query("UPDATE all_equipment SET available = 0 WHERE id = ?",[req.params.id], function(err, rows){
            if(err) throw err;
            else next();
        });
    },

    // get_update_profile:  function(req, res){
    //     connection.query("SELECT * FROM account WHERE id = ?" ,[req.session.user],function(err,rows){
    //         if (err) throw err ;
    //         else res.render('./update_profile.ejs' , {msg : '' , user_data : rows[0]});
    //     });
    // },

    // post_update_profile :  function(req, res){
    //     var updateQuery = "UPDATE account SET email = ?, address = ?, city = ?, state = ?, country = ?, zipcode = ? WHERE id =?";
    //     connection.query(updateQuery, [req.body.email, req.body.address, req.body.city, req.body.state, req.body.country, req.body.zipcode, req.session.user],function (err, rows) {
    //         if (err) throw err;
    //         else {
    //             connection.query("SELECT * FROM account WHERE id = ?" ,[req.session.user],function(err1,rows1){
    //                 if (err) throw err ;
    //                 else res.render('./update_profile.ejs' , {msg : 'Profile Updated' , user_data : rows1[0]});
    //             });          
    //         }
    //     });
    // },

    get_add_equipment : function(req,res){
        res.render('./admin_add_equipment.ejs', {msg : '', cat_rows:cat_rows,username: req.session.name});                             
    },

    get_add_equipment_user : function(req,res){
        res.render("./admin_add_equipment_user.ejs", {username: req.session.name});
    },

    post_add_equipment_reg: function(req,res, next){
        connection.query("SELECT id FROM account WHERE mobile = ?", [req.body.mobile], function(err,rows){
            if(err) throw err;
            else if(rows.length){ 
                req.session.owner_id = rows[0].id;
                return next();
            }
            else res.render("./admin_add_equipment_user.ejs", {username: req.session.name}); 
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
                    uploaded_by : 1
        }; 

        connection.query("SELECT type_id FROM equipment_type WHERE category = ? AND subcategory = ? AND brand = ? AND model = ?", [name.category, name.subcategory, name.brand, name.model], function(err, rows){
            if(err) throw err;
            else { 
         
                name.type_id = rows[0].type_id; 
                connection.query("SELECT name, city, state FROM account WHERE id = ?", [req.session.owner_id], function(err,rows){
                    if (err) throw err;
                    else {
                        name.city = rows[0].city;
                        name.state = rows[0].state;


                var radicle = '';
                connection.query("SELECT id FROM all_equipment ORDER BY id ASC", function(err,rows){
                    if(err) throw err;
                    else {
                        if(rows.length) radicle = rows.slice(-1)[0].id + 1;
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

                var insertQuery = "INSERT INTO all_equipment ( uploaded_by,photo1, photo2, photo3, photo4, doc_invoice, doc_insurance, doc_fitness, doc_rc, doc_poc, doc_roadtax ,type_id,state,available, category , brand, model, expected_price, year, colour, city, subcategory, description, km, owner_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                connection.query(insertQuery, [name.uploaded_by,photo_name[1],photo_name[2],photo_name[3],photo_name[4],doc_name[1],doc_name[2],doc_name[3],doc_name[4],doc_name[5],doc_name[6],name.type_id, name.state, name.available, name.category,name.brand, name.model, name.expected_price, name.year, name.colour, name.city, name.subcategory, name.description,name.km,name.owner_id],function (err4, resulti){
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
	//================================================================================
    //======================= ADMIN FUNCTIONS ========================================
    //================================================================================

    //Handle POST request to add a new working location 
    /*
    add_new_location : function(req, res){
    	var city = req.body.city;
    	var city = city.toUpperCase(); // Change CASE to uppercase for handling case-coflicts while comparing

    	connection.query("SELECT * FROM location WHERE city = ?",[city], function(err, rows) {
            if (err){
                throw err;
            }
            else if (rows.length) {
                req.send("That Location already exists");
            } else {
            	var state = req.body.state;
               	var insertQuery = "INSERT INTO location ( city, state, dealer_count, equipment_count) values (?,?,?,?)";
                // insert with initial deal_count, equipment_count to zero
               	connection.query(insertQuery, [city, state, 0, 0],function (err, rows) {
				    if (err) throw err;
				    console.log("New Location Added");
				});

				res.send("New Location Added");
            }
            return ;
    	});
    },

    // Show existing locations
    existing_location: function(req,res){
    	connection.query("SELECT * FROM location", function(err, rows){
    		if (err){
                throw err;
    		}
            // if there is no locations
    		else if (!rows.length) {
    			res.send("Please add a location to view"); 
    		}
    		else {
    			res.send(rows);
    		}
    	});
    },

    // Show all the sub-Admin working under the particuler logged in admin.
    existing_user: function(req,res){
        //query for searching from tree like stucture.
        selectquery = "select * from ( select  * FROM (select * from admin order by boss_id, id) products_sorted, (select @pv := ?) initialisation where find_in_set(boss_id, @pv) > 0 and @pv := concat(@pv, ',', id) ) a, account b where a.id = b.id";
    	connection.query(selectquery, [req.session.user], function(err, rows){
    		if (err){
                throw err;
    		}
    		else if (!rows.length) {
    			req.send("No User is working Under you");
    		}
    		else {
    			res.send(rows);
    		}
    	});
    },

    // Handle get request and give all locations for drop-down for adding new admin
    add_new_admin: function(req,res){
    	connection.query("SELECT sno, city FROM location", function(err, rows){
    		if (err){
                throw err;
    		}
    		else if (!rows.length) {
    			res.send('Please add a location to add a new admin');
    		}
    		else {
    			res.send(rows);
    		}
    	});
    },

    // Add a new admin under an admin and send a mail for resetting the password;
    add_new_admin_post_form: function(req,res){
    	var data = req.body;
        // if 
    	connection.query("SELECT * FROM account WHERE mobile = ?",[data.mobile], function(err, rows) {
            if (err)
                throw err;
            if (rows.length) {
                req.send("That mobile is already taken");
            } else {
   	            // if there is no user with that mobile number then create the user
                var insertQuery1 = "INSERT INTO account ( mobile, email, mobile, wallet, address) values (?,?,?,?,?,?,?)";
                var category = 3;
                var wallet = 0;
	            connection.query(insertQuery1,[data.mobile, data.email, data.mobile, wallet, data.address], function(err, rows) {
                    console.log(rows);
	            	if (err){
                		throw err;
    				}
    				else {
                    // insert data into admin table 
	            	var insertQuery2 = "INSERT INTO admin ( id, location, boss_id) values (?,?,?)";
	            	connection.query(insertQuery2,[rows.insertId, data.location, req.session.user]);
                    connection.query("SELECT * from account WHERE mobile = ?", [data.mobile], function(err, rows){
                        // generate mail to send to the email for reseting password
                        others.generate_mail(req, rows);
                        res.send("Mail Send to, Tell other admin to change password in an hour");
                    });
	            	}
	            });
            }
        });
    },
    
    // Handle post request to handle addition of standard equipment.
    add_new_equipment_post_form: function(req,res){
        data = req.body;
        var name = {};
        name.brand = data.brand;
        delete data["brand"];
        name.model = data.model;
        delete data["model"];
        name.varient = data.varient;
        delete data["varient"];
        var description = data.description;
        delete data["description"];
        data =JSON.stringify(data);

        // Check if equipment doesn't already exist.
        connection.query("SELECT * FROM std_equipment WHERE (brand = ? AND model = ? AND varient = ?)",[name.brand, name.model, name.varient], function(err, rows) {
            if (err){
                throw err;
            }
            else if (rows.length) {
                req.send("That Equipment already exists");
            } 
            else {
                var insertQuery = "INSERT INTO std_equipment (brand, model, varient, details, description, search_count, view_count, auction_count) values (?,?,?,?,?,?,?,?)";
                connection.query(insertQuery, [name.brand, name.model, name.varient, data, description, 0, 0, 0],function (err, rows) {
                    if (err) throw err;
                    else {
                        res.send("Added new Equipment");
                    }
                });
            }
        });
    },

    add_new_equipment_by_csv: function(req, res){
        //
        //
        //
        //
        //
    },

    // add new auction of D->C andd C->C type
    add_new_auction_post_form: function(req, res){
        var data = req.body;
        console.log(data);
        //Check if auction_timings does'nt clashes with already scheduled auction.
        var selectquery = "Select * from auction WHERE ( (type = ?) AND ( ( (start_time <= ? ) AND (? <= end_time) ) OR ( (start_time <= ? ) AND (? <= end_time) ) OR ( (? <= start_time) AND (? >= end_time) ) ) )"
        
        connection.query(selectquery,[2, data.start_time, data.start_time, data.end_time, data.end_time, data.start_time, data.end_time], function(err, rows){
            if(err) throw err;
            else if(rows.length){
                res.send('That Auction Timings clashes with another Auction');
                console.log(rows);
            }
            else{
                // Insert to auction table
                var insertQuery = "INSERT INTO auction (start_time, end_time, type) values (?,?,?)";
                connection.query(insertQuery, [data.start_time, data.end_time, 2],function (err, rows) {
                    if (err) throw err;
                    else {

                        console.log("New C->C + D->C Auction Added with start_time: " + data.start_time + " and end_time: " + data.end_time);

                        var upcoming_auction = functions.next_upcoming_auction(2);

                        if(!upcoming_auction){
                            //console.log("no_users");
                            res.send("New Auction Added");
                        }
                        else {
                            // Allocate cars to next_upcoming auction.
                            connection.query("UPDATE all_equipment SET auction = ? WHERE (auction_para = ?)", [upcoming_auction, 2], function(err, rows){
                                console.log("ALLOTED AUCTIONS");
                                res.send("New Auction Added");
                            });
                            // functions.insert_object(2);
                            // res.send("New Auction Added");
                        }
                    }
                });
            }
        });
    },


    // Add enquiry and send it to next higher admin
    enquiry_form_post_form : function(req, res){
        var data = req.body;
        var user = req.session.user;
        var category = req.session.category;

        // Select boss_id from admin
        selectquery = "SELECT boss_id from admin where id = ?"
        connection.query(selectquery, [user], function(err, rows){
            console.log(rows);

            connection.query("INSERT INTO enquiry (sender_id, reciever_id, description, subject) values (?,?,?,?)",[user, rows[0].boss_id, data.description, data.subject], function(err, rows){
                if(err) throw err;
                else{
                    res.send("your enquiry is submitted");
                }
            } );
        });
    },



    //Schedule for scheduling daily auction C->D auctions
    schedule_auction : function(){
        // config things that we need
        var rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [new schedule.Range(0, 6)];
        rule.hour = 1;
        rule.minute = 0;
        today_date =  new Date();

        // convert date time to correct format.
        var start_time = today_date.getFullYear() + '-' + today_date.getMonth() + '-' + today_date.getDate() + 'T' + DAST;
        var end_time = today_date.getFullYear() + '-' + today_date.getMonth() + '-' + today_date.getDate() + 'T' + DAET;

        console.log('node-schedule is running');

        //schedule job at 1:00AM daily to schdule a C->D auction
        var j = schedule.scheduleJob(rule, function(){
            addquery = "INSERT INTO auction (start_time, end_time, type) values (?,?,?)"
            connection.query(addquery, [start_time, end_time, 1], function(err, rows){
                if (err) throw err;
                else{
                    console.log("New Auction Added");
                    //call this function to add at the end of auction
                    module.exports.end_schedule(rows.insertId, end_time);
                }
            });
        });
    },

    // Things to do at the end of the auction
    end_schedule : function(auction_id, end_time){

        var j = schedule.scheduleJob(end_time, function(){
            //insert all data into auction_bid after the auction

            selectquery = "INSERT INTO auction_object (id, equip_id, auction_id, buyer_id, maxi_bid, time, mini_bid) (select a.*, b.mini_bid from (SELECT b.* from (SELECT equip_id, MAX(bid_price) AS bid_price FROM bids where auction_id = ? GROUP BY equip_id) a, bids b where a.equip_id = b.equip_id AND a.bid_price = b.bid_price and auction_id = ?) a, all_equipment b where a.equip_id = b.id OR (b.mini_bid = b.next_bid AND auction = ?) )";


            connection.query(selectquery, [auction_id, auction_id, auction_id], function(err, rows){
                if(err) throw err;
                else {
                    console.log("Insert in auction_aubject completed");
                }
            });

            // Update action_para to 4 if someone has bidded else change it to 0
            updatequery = "update all_equipment set auction_para = CASE WHEN mini_bid = next_bid THEN '0' ELSE '4' END WHERE auction = ?"
            connection.query(update,)

            res.end("Auction Ended", [auction_id], function(err, rows){
                if(err) throw err;
                else {
                    console.log("updated auction_para");
                }
            });

        });
    },

    change_time : function (req, res){
    	DAST = req.body.start_time;   //this is type = "time"
    	DAET = req.body.end_time;
    },

    // see all pending delar verifications
    pending_request: function(req, res){
        // join for selecting data from both tables
        connection.query(selectquery = "SELECT * (Select * FROM dealer where is_authenthcated = ?) a, account b where a.id = b.id",[0], function(err, rows){
            if (err) throw err;
            else{
                res.send(rows);
            }
        });
    },

    // change dealer verfication status when verified
    verified : function(req, res){
        connection.query("update dealer set is_authenthcated = ? where id = ?", [1, req.body.id], function(req, res){
            if(err) throw err;
            else res.send("Dealer is verified");
        });
    }
    */

}