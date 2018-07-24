
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

// var DAST = "15:00:00";
// var DAET = "20:00:00";

// =========================================================



module.exports = {

//================================================================================
//======================= ADMIN FUNCTIONS ========================================
//================================================================================
    //get_login and post_login in routes page...passport k pain tha
  
//-----------------------------------generic website funtions -------------------------------------------

   //enquiry info to admin (admin_inquiry.ejs is to be designed)
   
    // inEmail : function(req, res){
    //     connection.query("SELECT * FROM enquiry WHERE status = 0",function(err, rows, fields){
    //         if(err) throw err;
    //         else {
    //             connection.query("SELECT * FROM enquiry WHERE status = 1",function(err1,rows1){
    //                 if(err1) throw err1;
    //                 else res.render('./admin_inquiry.ejs',{current:rows , previous: rows1, username:req.session.name});
    //             });
    //         }
    //     });
    // },
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

    change_status : function(req,res){ 
        connection.query("UPDATE ? SET status = ? WHERE sno = ?",[req.body.table, req.body.status, req.params.sno],function(err,rows){
            if(err) throw err;
            else res.send("lo ho gaya......");
        });
    },

    comment : function(req,res,next){ 
        connection.query("UPDATE ? SET comment = ? WHERE sno = ?", [req.body.table,req.body.comment,req.params.sno], function(err){
            if(err) throw err;
            else return next();
        });
    },
    //$$redundant
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
        //$$if possible left join try kar lena
        featured = [];
        prev_featured = [];
        feat_details = [];
        str1 = "SELECT featured.equip_id,featured.views, featured.start_date, featured.end_date, featured.display,all_equipment.photo1, all_equipment.expected_price, all_equipment.subcategory, all_equipment.brand, all_equipment.model, all_equipment.owner_id FROM all_equipment INNER JOIN featured ON featured.equip_id = all_equipment.id";
        connection.query(str1, function(err,rows){
            if(err) throw err;
            else{
                for(var i = 0; i<rows.length; i++){
                    if(rows[i].display) featured.push(rows[i]);
                    else {prev_featured.push(rows[i]);
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
                        //$$put above 3 arrays in request
                        //$$req.datarows <= array of json st datarows[i].equip_id
                        //$$req.fields <= fields of datarows
                        return next();//$$gfunc.equip_data
                    }
                });
           } }
        });
    },
  
    featured: function(req,res){
        res.render('./admin_featured.ejs' , {featured: featured, feat_details:feat_details, prev_featured : prev_featured, feat_data: feat_data, username:req.session.name});                
    },

    remove_featured: function(req,res,next){
        connection.query("UPDATE featured SET display = 0, end_date =current_timestamp() WHERE equip_id = ?",[req.params.id],function(err){
            if(err) throw err;
            else next();
        });
    },

    get_add_featured: function(req,res){
        if(featured.length < 3) res.render("./admin_add_featured.ejs", {featured:featured , feat_data:feat_data, feat_details:feat_details, datarows:datarows, data:data, username:req.session.name});
        else res.render('./admin_featured.ejs' , {featured: featured, feat_details:feat_details, prev_featured : prev_featured, feat_data: feat_data, username:req.session.name});                 
    },

    post_add_featured: function(req,res, next){
        
        connection.query('SELECT * FROM featured WHERE equip_id=? and display = 1',[req.params.id],function(err1,rows1){
            if(err1) throw err1;
            else if(rows1.length) return next();
            else{
                connection.query("INSERT INTO featured (equip_id,display,start_date, views, end_date) VALUES (?,?,current_timestamp(),?,?)",[req.params.id,1,0, 0], function(err){
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
        req.title = "Available Equipments";
        res.render("./admin_view_equipment.ejs", { title : req.title, datarows:datarows, data:data, username:req.session.name});
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
                                req.title = "All Equipments"; 
                                res.render("./admin_view_equipment.ejs", {title : req.title,datarows:rows, data:info, username:req.session.name});
                            }
                        });
                    }
                });
            }
        });
    },

    my_equipment: function(req , res){
        str4 = "SELECT all_equipment.id,all_equipment.available, all_equipment.category, all_equipment.subcategory, all_equipment.brand, all_equipment.model,all_equipment.expected_price,account.name, account.address1, account.address2, account.address3, account.city, account.state, account.zipcode, account.email, account.mobile FROM account INNER JOIN all_equipment ON all_equipment.owner_id = account.id WHERE all_equipment.uploaded_by = 1"
        connection.query(str4, [req.session.user] , function(err, rows){
            if (err) throw err;
            else return next();
        });
    },


    get_reset_password : function(req,res){
        res.render("./admin_reset_password.ejs", {msg:'', username:req.session.name});
    },
    // check category then redirect accordingly..
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
            else res.render('./admin_update_equipment.ejs' , {equip_data : rows[0], username: req.session.name, category:req.session.category, category:req.session.category});
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

    get_add_new_admin: function(req,res){
     res.render('./Profiles/admin/add_new_admin.ejs', {msg: 'Enter the following details' , username:req.session.name});
    },

    post_add_new_admin: function(req,res){
     if(req.body.password == req.body.retype_password){
        connection.query("SELECT * FROM account WHERE name = ?",[req.body.name], function(err, rows) {
            if (err) throw err;
            if (rows.length) res.render('./Profiles/admin/add_new_admin.ejs', {msg: 'That name is already taken' });
            else {
                // insert data into account table
                var newAdmin = {
                        name: req.body.name,
                        password: bcrypt.hashSync(req.body.password, null, null),  // use the generateHash function in our user model
                        category: 0,
                        email: req.body.email,
                        mobile: req.body.mobile
                    };
                var insertQuery1 = "INSERT INTO account ( name, email, mobile, category, password) values (?,?,?,?,?)";
                connection.query(insertQuery1,[newAdmin.name, newAdmin.email, newAdmin.mobile,newAdmin.category,newAdmin.password,], function(err) {
                    if (err) throw err;
                 else res.render('./Profiles/admin/homepage.ejs' ,{msg:'Admin '+req.body.name+ ' added'});
                });
            }
        });
        }
        else res.render('./Profiles/admin/add_new_admin.ejs', {msg:'Passwords do not match'});
    },

    home:function(req, res) {
        //$$stats missing
        return res.render('./admin_dashboard.ejs', {category:req.session.category, username : req.session.name});
    },
    
    get_equipment_type_csv : function(req,res){
        req.title = "Equipment Type";
        res.render("admin_upload_csv.ejs", {what:req.title, username : req.session.name, img_name : 'type_csv_format.png'});
    },

    get_equipment_csv : function(req,res){
        req.title = " New Equipment";
        res.render("admin_upload_csv.ejs", {what:req.title, username : req.session.name, img_name: 'equipment_csv_format.png'});
    },

    //$$page need to be changed
    get_add_equipment_type : function(req,res){
        res.render('./admin_add_equipment_type.ejs', {username:req.session.name, category:req.session.category});
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
        res.render('./admin_add_equipment.ejs', {msg : '', cat_rows:cat_rows,username: req.session.name, category:req.session.category, category:req.session.category});                             
    },

    get_add_equipment_user : function(req,res){
        res.render("./admin_add_equipment_user.ejs", {username: req.session.name, category:req.session.category, category:req.session.category});
    },

    post_add_equipment_reg: function(req,res, next){
        connection.query("SELECT id FROM account WHERE mobile = ?", [req.body.mobile], function(err,rows){
            if(err) throw err;
            else if(rows.length){ 
                req.owner_id = rows[0].id;
                return next();
            }
            else res.render("./admin_add_equipment_user.ejs", {username: req.session.name, category:req.session.category}); 
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
                connection.query("SELECT name, city, state FROM account WHERE id = ?", [req.owner_id], function(err,rows){
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
                        req.msg = "Your equipment is added successfully...";
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


      //show_auc.ejs is to be designed..
     //this is to be called in routes
    show_auctions : function(req,res){        
         connection.query("SELECT auctions.name AS 'Auction Name', auctions.start_date AS 'Start Date/time', auctions.end_date AS 'End Date/time', count(auction_equipment.auction_id) as 'No of equipments', auctions.auction_id AS id FROM auctions LEFT JOIN auction_equipment ON auctions.auction_id = auction_equipment.auction_id WHERE auctions.end_date < current_timestamp() GROUP BY auctions.auction_id ORDER BY auctions.auction_id", function(err1,rows1, fields){
            if (err1) throw err1 ;
            else{ 
                connection.query("SELECT auctions.auction_id, count(case auction_requests.auction_id when 1 then 1 else null end) as participants FROM auctions LEFT JOIN auction_requests ON auctions.auction_id = auction_requests.auction_id GROUP BY auctions.auction_id ORDER BY auctions.auction_id",function(err2,rows2){
                    if(err2) throw err2;
                    else{
                        obj = {name:"Participants"};
                        fields.push(obj);
                        console.log(rows1.length);
                        console.log(rows2.length);
                        for(var i = 0 ; i<rows1.length; i++ ){
                            y = JSON.stringify(rows1[i]);
                            y = y.slice(0,-1);
                            y = y + ',"Participants":"'+rows2[i][participants]+'"}';
                            rows1[i] = JSON.parse(y);
                        }
                        res.render("./table.ejs",{datarows : rows , fields:fields , title:"Previous Auctions", username : req.session.name});
                    }
                });
            }
         });
    },


     //show_auc_req.ejs is to be designed
    // to be  called by auction_id
    show_auc_req :function(req,res){
    	connection.query(" SELECT account.name, account.state, account.category, account.id FROM account INNER JOIN auction_requests ON auction_requests.user_id = account.id WHERE auction_id= ?",[req.params.auction_id], function(err,rows){

    		if(err) throw err ;
    		else{
    			return res.render("./show_auc_req.ejs",{datarows:rows ,username:req.session.name});
    		}
    	});
    },


    




    //---------- schedule auction---------------
    //get - page render
    get_schedule_auction: function(req,res){
        res.render("", {username:req.session.user, datarows:[]});
    },

    //check schedule (only one auction should be live at a time)
    check_schedule_auction: function(req,res){
        start_date = req.body.start_date; 
        end_date = req.body.end_date;
        connection.query("SELECT * FROM auctions", function(err,rows){
            if(err) throw err;
            else if(rows.length){
                for(i = 0 ; i<rows.length; i++){
                    if(start_date<rows[i].end_date){
                        if(end_date>rows[i].start_date) continue;
                        else res.send(rows[i]);
                    }
                    else if(i == rows.length) return next();
                }
            }
            else next();
        });
    },

   //changed according to update and add admin to auction requests by default - make another function 
    post_schedule_auction1: function(req,res){
        if(req.params.auction_id){
            connection.query("UPDATE auctions SET name = ? , start_date = ? , end_date = ?, max_no_equipment = ?",[req.body.name, req.body.start_date, req.body.end_date, req.body.max_no_equipment],function(err){
                if(err) throw err;
                else return next();
            });
        }
        else{
            connection.query("INSERT INTO auctions (name, start_date, end_date, max_no_equipment) VALUES (?,?,?,?)",[req.body.name, req.body.start_date, req.body.end_date, req.body.max_no_equipment],function(err){
                if(err) throw err;
                else return next();
            });
        }
    },
    
    //post_schedule_auction - insert into auctions render select_equipments,(data), no of selected = 0
    post_schedule_auction2 : function(req,res){    
        connection.query("SELECT equip_id FROM auction_equipment WHERE auction_id = ?",[rows[0].insertId], function(err2,rows2){
            if(err) throw(err);
            else{
                req.selected_equip = [];
                for(var i = 0; i < rows2.length;i++){
                    req.session.selected_equip.push(rows2[i].equip_id);
                }
                connection.query("SELECT * FROM all_equipment WHERE status = 2",function(err1,rows1){
                    if(err1) throw err1;
                    else  res.render("", {datarows:rows1, username:req.session.user, selected : req.selected_equip, max_no_equipment : req.body.max_no_equipment});
                });
            }
        });
    },

    //select_this_equipment - (ajax)
    select_this_equipment: function(req,res){
        //$$req.session.selected_equip h in next 2 func also
        if(req.session.selected_equip.length<req.body.max_no_equipment){
            req.selected_equip.push(req.params.equip_id);
            res.send("Equipment added to auction", req.selected_equip);
        }
        else res.send("You have reached limit for your auction", req.selected_equip);
    },

    //deselect - (ajax)
    deselect: function(req,res){
        index = req.selected_equip.indexOf(req.params.equip_id);
        req.selected_equip.splice(index,1);
        res.send("Equipment is removed from this auction", req.selected_equip);
    },

    //post_freeze auction - insert into auction equip
    //divided into 2 because of async
    freeze_this_auction1: function(req,res){
        selected_equip = req.selected_equip;
        auction_id = req.params.id;
        connection.query("SELECT equip_id FROM auction_equipment WHERE auction_id = ?",[auction_id], function(err,rows){
            if(err) throw err;
            else{ 
                if(rows.length){
                    for(var i=0;i<rows.length;i++){
                        index = selected_equip.indexOf(rows[i].equip_id);
                        selected_equip.splice(index,1);
                        if(i == rows.length - 1){
                            req.selected_equip = selected_equip;
                            return next();
                        }
                    }
                }
            }
        });
    },

    freeze_this_auction2 :function(req,res){
        if(selected_equip.length){
            str = selected_equip.stringify;
            str = str.slice(1,-1);
            connection.query("SELECT expected_price, id FROM all_equipment WHERE id IN (?)", [str], function(err1,rows1){
                if(err1) throw err1;
                else{
                    str = "INSERT INTO auction_equipment VALUES";
                    for(var i=0; i <selected_equip;i++){
                        str = str + "("+auction_id+","+selected_equip[i]+","+rows1[i].expected_price+",0),";    
                    }
                    str = str.slice(0,-1);
                    connection.query(str, function(err){
                        if(err) throw err;
                        else return res.send("done");// or send to equiplist of an auction :/
                    });
                }
            });
        }
        else return res.send("done");// or send to equiplist of an auction :/          
    },
    
    //view_selected - page render with data id in session and data in all_equipment
    view_selected:function(req,res){
        str = selected_equip.stringify;
        str = str.slice(1,-1);
        connection.query("SELECT * FROM all_equipment WHERE id IN (?)", [str], function(err1,rows1){
            if(err1) throw err1;
            else res.render("",{datarows:rows[0], username:req.session.name});
        });       
    },

    edit_this_auction: function(req,res){
        connection.query("SELECT * FROM auctions WHERE auction_id = ?",[req.params.auction_id],function(err,rows){
            if(err) throw err;
            else res.render("auction_form.ejs",{datarows:rows, username:req.session.name});
            //schedule auction wala
        });

    }, 

    //------------- live auction------------
    // get - select from auction_equipment + all_equipments +highest bidder + #bids
    get_live_auction: function(req,res, next){
        connection.query("SELECT auction_id FROM auctions  WHERE auctions.start_date < current_timestamp() AND end_date > current_timestamp()", function(err,rows){
            if(err) throw err;
            else {
                req.auction_id = rows[0].auction_id;
                return next();
            }
        });
    },
    
    this_auction : function(req,res){
        connection.query("SELECT * FROM auctions WHERE auction_id = ?",[req.params.auction_id],function(err1,rows1){
            if(err1) throw err1;
            else{
                connection.query("SELECT all_equipment.category, all_equipment.subcategory, all_equipment.brand, all_equipment.model, auction_equipment.*, count(bids.equip_id) FROM all_equipment LEFT JOIN auction_equipment ON all_equipment.id=auction_equipment.equip_id LEFT JOIN bids ON all_equipment.id = bids.equip_id WHERE auction_equipment.auction_id = ? AND bids.auction_id = ? GROUP BY all_equipment.id ORDER BY all_equipment.id",[req.auction_id, req.auction_id], function(err,rows){
                    if(err) throw err;
                    else {
                        connection.query("SELECT MAX(bids.bid_amount), bids.user_id FROM bids LEFT JOIN auction_equipment ON auction_equipment.equip_id = bids.equip_id WHERE bids.auction_id = ? AND auction_equipment.auction_id = ? GROUP BY auction_equipment.equip_id ORDER BY auction_equipment.equip_id", [req.auction_id,req.auction_id], function(err2,rows2){
                            if(err2) throw err2;
                            else {
                                
                                res.render("", {auction :rows1, equip :rows, bidder:rows2});}
                        }); 
                    }
                });  
            }  
        }); 
    },

    // post_bid - from user fx (ajax)
    
    //bid_log - data from bids // page
    bid_log: function(req,res){
        connection.query("SELECT * FROM bids WHERE auction_id = ? ORDER BY bid_amount DESC",[req.params.auction_id], function(err,rows){
            res.render("",{datarows:rows, username:req.session.name});
        });
    },

    // view_bids - select from bids where (show 1st, 2nd, 3rd)
    view_bids: function(req,res){
        connection.query("SELECT * FROM bids WHERE auction_id = ? AND equip_id = ? ORDER BY DESC",[req.params.auction_id, req.params.equip_id], function(err,rows){
            if(err) throw err;
            else res.render("", {datarows:rows, username:req.session.name});
        });
    },

   add_master : function(req,res){
    connection.query("SELECT * from equipment_master WHERE subcategory=?",[req.body.subcategory],function(err,rows){
        if (err) throw err ;
        else if(rows.length){
                return res.send("subcategory already exists.....");
        }
        else{
            connection.query("INSERT INTO equipment_master (category,subcategory,engine,speed,mixer_tank_capacity,four_wheel_drive,two_wheel_drive,max_digging_depth,bucket_volumetric_capacity,shovel_volumetric_capactiy,operating_weight,single_drum,double_drum,volumetric_output,roller_width,roller_dia,body_size,blade_length,concrete_pressure,mobile,stationary,max_lift,stablizer,boomarm_length,horizontal_deliver,vertical_deliver,blade_width,max_paving_width,current,fuel_consumption,other1,other2,other3,other4) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[req.body.category,req.body.subcategory,req.body.engine,req.body.speed,req.body.mixer_tank_capacity,req.body.four_wheel_drive,req.body.two_wheel_drive,req.body.max_digging_depth,req.body.bucket_volumetric_capacity,req.body.shovel_volumetric_capactiy,req.body.operating_weight,req.body.single_drum,req.body.double_drum,req.body.volumetric_output,req.body.roller_width,req.body.roller_dia,req.body.body_size,req.body.blade_length,req.body.concrete_pressure,req.body.mobile,req.body.stationary,req.body.max_lift,req.body.stablizer,req.body.boomarm_length,req.body.horizontal_deliver,req.body.vertical_deliver,req.body.blade_width,req.body.max_paving_width,req.body.current,req.body.fuel_consumption,req.body.other1,req.body.other2,req.body.other3,req.body.other4],function(err1, rows1){
                if (err1) throw err1;
                else{
                    radicle = "m" + rows1.insertId;
                    var default_image = req.files.default_image;
                    imgname = default_image.name;
                    result = imgname.split('.');
                    img_name = radicle+'.'+result.slice(-1) ;
                    default_image.mv('images/master/'+img_name , function(err3){           
                        if (err3) throw(err3);
                    });
                    connection.query("UPDATE equipment_master SET default_image = ? WHERE master_id=?",[img_name,rows1.insertId],function(err2){
                        if(err2) throw err2;
                        else return res.send("data successfully added");
                    });
                }
            });
        }
    });
   },

   // called in routes
   show_master : function(req,res){
     connection.query("SELECT master_id,category,subcategory FROM equipment_master",function(err,res){
        if (err) throw err ;
        else
        {
            return res.render('./show_master.ejs',{datarows:rows, username : req.session.name, category:req.session.category});
        }
     });
   },
   //called in routes
   get_update_master : function(req,res){
    connection.query("SELECT * from equipment_master WHERE master_id=?",[req.params.id],function(err,rows){
        if(err) throw err ;
        else {
            res.render('./get_update_master.ejs',{datarows : rows, username : req.session.name, category:req.session.category });
        }
    });
   },


   //next will show_master....
   //called in routes
   post_update_master : function(req,res,next){
    update={
        category: req.body.category,
        subcategory:req.body.subcategory,
        engine : req.body.engine,
        speed : req.body.speed,
        mixer_tank_capacity : req.body.mixer_tank_capacity,
        four_wheel_drive : req.body.four_wheel_drive,
        two_wheel_drive : req.body.two_wheel_drive, 
        max_digging_depth : req.body.max_digging_depth, 
        bucket_volumetric_capacity : req.body.bucket_volumetric_capacity,
        shovel_volumetric_capactiy : req.body.shovel_volumetric_capactiy,
        operating_weight : req.body.operating_weight,
        single_drum : req.body.single_drum,
        double_drum : req.body.double_drum,
        volumetric_output : req.body.volumetric_output,
        roller_width : req.body.roller_width,
        roller_dia : req.body.roller_dia,
        body_size : req.body.body_size,
        blade_length : req.body.blade_length,
        concrete_pressure : req.body.concrete_pressure,
        mobile : req.body.mobile,
        stationary : req.body.stationary,
        max_lift : req.body.max_lift,
        stablizer : req.body.stablizer,
        boomarm_length : req.body.boomarm_length,
        horizontal_deliver : req.body.horizontal_deliver,
        vertical_deliver : req.body.vertical_deliver,
        blade_width : req.body.blade_width,
        max_paving_width : req.body.max_paving_width,
        current : req.body.current,
        fuel_consumption : req.body.fuel_consumption,
        other1 : req.body.other1,
        other2 : req.body.other2,
        other3 : req.body.other3,
        other4 : req.body.other4,

    }
    connection.query("UPDATE equipment_master SET ? WHERE master_id=?",[update,req.params.id],function(err){
               if(err) throw err ;
               else{
                return next();
               }
    });
   },
    
    //called
    //users - name - category, #equip(count + innerjoin all_equipment(owner_id)), state from account table 
    show_user : function(req,res){
        connection.query("SELECT account.id, account.name, account.category, account.state, count(all_equipment.owner_id)as no_of_equip FROM account INNER JOIN all_equipment ON account.id=all_equipment.id WHERE account.id=? GROUP BY account.id",[req.params.id],function(err,rows){
            if(err)throw err ;
            else{
                res.render("./show_user.ejs",{datarows:rows, username :req.session.name});
            }
        });
    },
     

     // called in routes..
     //user_profile - upar wala data + all.equipment.*, requested equipments(requests);
    show_user_profile1 : function (req,res,next){
        connection.query("SELECT account.*, all_equipment.id, all_equipment.brand, all_equipment.model, all_equipment.category, all_equipment.subcategory,all_equipment.status FROM account INNER JOIN all_equipment ON account.id=all_equipment.id WHERE account.id=?",[req.params.id],function(err,rows){
            if (err)throw err;
            else{req.show_users=rows; 
                req.user_id= req.params.user_id;
                return next();// ufunc.my_requests1->my_requests2->myrequests3->show_user_profile2
            }
        });
    },
    
    //called in routes
    show_user_profile2 : function(req,res){
        return res.render('./show_user_profile.ejs',{username:req.session.name,category:req.session.category});
    },

    //auction_summary - show auctoios - params m auction_id, fuction to convert it to session.auction_id, this_acution()
    auction_summary:function(req,rows, next){
        req.auction_id = req.params.auction_id;
        return next();
    },

    //get add equipment master
    //post

    //equip_requests - pending first
    show_equipment_requests1: function(req,res,next){
        new_equip = [];
        used_equip = [];
        interested = [];
        connection.query("SELECT * FROM requests ORDER BY status",function(err,rows){
            if(err) throw err;
            else{
                for(var i =0 ; i <rows.length; i ++){
                    equip_id = rows[i].equip_id + '';
                    if(rows[i].equip_id[0] == 't'){
                        equip_id = equip_id.slice(1);
                        new_equip.push(equip_id);
                    }
                    else used_equip.push(equip_id);
                    if(rows[i].status ==2) interested.push(rows[i].sno)
                    if(i == (rows.length-1)){
                        req.new_equip = new_equip;
                        req.used_equip = used_equip;
                        return next();// user/my_requests2, my_requests3, my_requests4
                    }
                }
            }
        });
    },

    show_equipment_requests2: function(req,res){
        res.render("./user_requested.ejs", {new_equip: req.new_equip, used_equip: req.used_equip, proposals:req.proposals, username:req.session.name});
    },

    find_fields : function(req,res,next){
    	display_fields=[];
    	connection.query("SELECT * FROM equipment_master WHERE subcategory=?",[req.query.subcategory],function(err,rows,fields){
    		if(err) throw err;
    		else{
    			if(rows.length){
    				for(var i=3; i<(fields.length-4);i++)
    				{
    					if(rows[0][fields[i].name]){
    						y = (String)(fields[i].name);
    						y = y.replace('_', ' ');
    						display_fields.push(y);
                     		}
                          if(i == (fields.length-5))   
    				    {req.display_fields=display_fields;
                            req.rows = rows;
                            req.fields = fields;
    				    	return next();
    				    }
    				}
                }
                else return res.send("subcategory not found");    
    		}
    	});
    },

 find_fields2 : function(req,res){
	display_fields=req.display_fields;
    rows =req.rows;
    fields = req.fields;
	// connection.query("SELECT * FROM equipment_master WHERE subcategory=?",[req.query.subcategory],function(err,rows){
	// 	if(err)throw err ;
	// 	else {
			for ( var i =(fields.length-4); i<fields.length;i++ ){
                 if(rows[0][fields[i].name]){
                 	display_fields.push(rows[0][fields[i].name]);
                 }
		        if(i==(fields.length - 1) )return res.send(display_fields); 
            }

		 //console.log(display_fields);
	// 	}
	// });
    },

    
    //dealer auction 

	//================================================================================
    //======================= ADMIN FUNCTIONS ========================================
    //================================================================================

    /*
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