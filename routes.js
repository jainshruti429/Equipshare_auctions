// app/routes.js

//load all the things needed.
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.connection.database);


var express  = require('express');
var app = express();
// var fileUpload = require('express-fileupload');
// app.use(express.static(path.join(__dirname,'/docs')));
// app.use(express.static(path.join(__dirname,'/images')));
// app.use(express.static(path.join(__dirname, "/public")));
// app.use(express.static(path.join(__dirname, "/")));
// app.use(fileUpload());

// import functions from other files.
var general_functions = require('./app/general_functions') //common functions
var admin_functions = require('./app/admin_functions'); //admin side functions
var user_functions = require('./app/user_functions'); 
var csv = require('./app/csv');

// ==========================================
module.exports = function(app, passport) {

    // HOME PAGE
    app.get('/', functions.isLoggedInfunc, function(req, res) {
        console.log("Logged in with id: " + req.session.user);
        connection.query("SELECT first_name from account where id = ?", [req.session.user], function(err,rows){
            data = {
                id: req.session.user,
                name: rows[0].first_name,
                msg: "Hello, Welcome"
            };
            res.send(data);
        });
    });

    // LOGIN
    // show the login form or redirct to profile if already logged in
    app.get('/login', functions.loginfunc);

    // process the LOGIN form
    app.post('/login', function(req, res, next){
        passport.authenticate('local-login', function (err, 
                                                        
                                                      , info) {
            //this function is called when LocalStrategy returns done function with parameters

            //if any error , throw error to default error handler
            if(err) throw err;

            //if username or password doesn't match
            if(!user){
                return res.send({msg: info});
            }

            //this is when login is successful
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
            
        })(req,res,next),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
        }
    });

    // SIGNUP ==============================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', function(req, res, next){
        passport.authenticate('local-signup', function (err, user, info) {
            //this function is called when LocalStrategy returns done function with parameters

            //if any error , throw error to default error handler
            if(err) throw err;

            //if username or password doesn't match
            if(!user){
                return res.send({msg: info});
            }

            //this is when login is successful
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
            
        })(req,res,next),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
        }
    })

    // PROFILE SECTION =====================
    app.get('/profile/:id', functions.isLoggedInfunc, functions.profilefunc); // issLoggedIn verifies that user is authenticated

    // LOGOUT ==============================
    app.get('/logout', functions.logoutfunc);
    // =====================================

    app.get('/dashboard', functions.isLoggedInfunc, functions.dashboard);

    app.get('/wallet',functions.isLoggedInfunc, functions.walletfunc);

    //this is post for forgot password which requires user's email id
    app.post('/forgot', functions.forgot);

    //this route will verify the password token hasn't expire and returns a json response
    app.get('/reset/:token', functions.reset_pass);

    //POST for password reset and if token hasn't expired, the password of user is reset.
    app.post('/reset/:token', functions.reset_pass_post_form);

    app.post('/add_to_likes', functions.isLoggedInfunc, dealer_user_access, functions.add_to_likes);

    app.post('/search_suggestions', functions.isLoggedInfunc, dealer_user_access, functions.search_suggestions);

    app.post('/search', functions.isLoggedInfunc, dealer_user_access, functions.search);

    app.get('/my_likes', functions.isLoggedInfunc, dealer_user_access, functions.my_likes);    

     app.get('/show_car/:id', functions.isLoggedInfunc, functions.show_car);

    //================================================================================
    //======================= ADMIN ROUTES ===========================================
    //================================================================================


    app.post('/admin/new_location', functions.isLoggedInfunc, admin_access, functions_admin.add_new_location);
    app.get('/admin/existing_location', functions.isLoggedInfunc, admin_access, functions_admin.existing_location);
    app.get('/admin/existing_user', functions.isLoggedInfunc, admin_access, functions_admin.existing_user);
    app.get('/admin/add_new_admin', functions.isLoggedInfunc, admin_access, functions_admin.add_new_admin);
    app.post('/admin/add_new_admin', functions.isLoggedInfunc, admin_access, functions_admin.add_new_admin_post_form);
    app.post('/admin/add_new_equipment', functions.isLoggedInfunc, admin_access, functions_admin.add_new_equipment_post_form);
    app.post('/admin/add_new_auction', functions.isLoggedInfunc, admin_access, functions_admin.add_new_auction_post_form);

    app.get('/existing_dealers', functions.isLoggedInfunc, functions.existing_dealers);    //common for admin and dealer

    app.post('/admin/enquiry_form', functions.isLoggedInfunc, admin_access, functions_admin.enquiry_form_post_form);
    app.post('/admin/change_time', functions.isLoggedInfunc, admin_access, functions_admin.change_time);
    app.get('/pending_request', functions.isLoggedInfunc, admin_access, functions_admin.pending_request);
    app.post('/verified', functions.isLoggedInfunc, admin_access, functions_admin.verified);

    //================================================================================
    //======================= DEALER ROUTES + USER ROUTES ============================
    //================================================================================

    app.get('/dealer/complete_profile', functions.isLoggedInfunc, dealer_access, functions_dealer.complete_profile);
    app.post('/dealer/complete_profile', functions.isLoggedInfunc,  dealer_access, functions_dealer.complete_profile_post_form);
    app.get('/add_car', functions.isLoggedInfunc, dealer_user_access, functions.add_car); 
    app.post('/add_car', functions.isLoggedInfunc, dealer_user_access,  functions.add_car_post_form);
    app.get('/dealer_my_equipment', functions.isLoggedInfunc, dealer_user_access,  functions.dealer_my_equipment); 
    app.post('/change_auction_status', functions.isLoggedInfunc, dealer_user_access,  functions.change_auction_status);
    app.get('/dealer/dealer_purchase', functions.isLoggedInfunc, dealer_access,  functions_dealer.dealer_purchase);
    app.post('/dealer/dealer_purchase',functions.isLoggedInfunc, dealer_access,  functions_dealer.dealer_purchase_post_form);
    app.get('/dealer/dealer_sell', functions.isLoggedInfunc, dealer_access,  functions_dealer.dealer_sell);
    app.post('/dealer/dealer_sell', functions.isLoggedInfunc, dealer_access,  functions_dealer.dealer_sell_post_form);
    app.get('/dealer/sell_lead', functions.isLoggedInfunc, dealer_access, functions_dealer.sell_lead);
    app.post('/dealer/schedule', functions.isLoggedInfunc, dealer_access, functions_dealer.schedule);
    app.get('dealer//my_schedule', functions.isLoggedInfunc, dealer_access, functions_dealer.my_schedule);

    app.get('/next_auction', functions.isLoggedInfunc, dealer_user_access,  functions.next_auction);
    app.get('/my_bids', functions.isLoggedInfunc, dealer_user_access,  functions.my_bids);


    //app.get('/deal', 
    //================================================================================
    //======================== General Routes ========================================
    //================================================================================

    app.post('/add_new_bid', functions.isLoggedInfunc,dealer_user_access, functions.add_new_bid);


    // // TEMPORARY routes =================================================================

    app.get('/temp', function (req, res){
        // for temporary use
        query = "SHOW DATABASES";
        connection.query(query, function(err, rows){
            res.send(rows);
        });
    });

// =======================================================================================
// =========================== WITHOUT AUTHORISATION FUNCTIONS ====================================== 
// =======================================================================================

    //these functions do not require user to be logged in
    //HOME PAGE of website.... 
    // app.get('/', function(req,res){
    //     res.sendFile(__dirname+'/views/something.html');  
    // });
    app.get('/', general_functions.index);
    app.post('/featured:id',general_functions.featured);
    app.get('/search_category', general_functions.search_category);
    app.post('/search',general_functions.search);
    app.post('/view:id', general_functions.view);
    app.post('/email', general_functions.email, general_functions.index);
    
    
// =======================================================================================
// =========================== USER FUNCTIONS ================================================== 
// =======================================================================================
    app.get('/login:id', general_functions.login);
    
    app.post('/user_login:id', function(req, res, next){
            //call the local-login in ../config/passport.js
            passport.authenticate('local-login', function (err, user, info) {
                // info is json given by passport.aunthicate
                //this function is called when LocalStrategy returns done function with parameters
                if(err) return res.render('./user_login.ejs', {msg : 'Please Try Again!', login_para : 1, id:req.params.id, isLoggedIn : 0 });    
                //if username or password doesn't match
                if(!user) return res.render('./user_login.ejs', {msg: 'Please Try Again!', login_para : 1, id:req.params.id, isLoggedIn : 0});  
                //this is when login is successful
                req.logIn(user, function(err) {
                    if (err) return res.render('./user_login.ejs', {msg : 'Please Try Again!', login_para : 1, id:req.params.id, isLoggedIn : 0}); 
                    else  return next();
                });   
            })(req,res,next);
        }, function(req,res,next){
            if(req.params.id != 0) return next();
            else return general_functions.index(req,res);
        }, general_functions.view);

    app.post('/user_signup:id', function(req, res, next){
            passport.authenticate('local-signup', function (err, user, info) {
                //this function is called when LocalStrategy returns done function with parameters
                if(err) return res.render('./user_login.ejs', {msg : 'Please Try Again!', id:req.params.id, login_para:0, isLoggedIn : 0});    
                //if username or password doesn't match
                if(!user) return res.render('./user_login.ejs', {msg:info.message, id:req.params.id, login_para:0, isLoggedIn : 0});
                if (req.body.password != req.body.retype_password) return res.render('./user_login.ejs',{msg:'passwords did not match', id:req.params.id, login_para:0, isLoggedIn : 0});
                //if (!req.body.agree) return res.render('./user_signup.ejs',{msg:'You need to agree to TnC'});          
                //this is when signup is successful
                else return res.render('./user_login.ejs',{msg:'Signup successful! Login to continue', login_para:1, id:req.params.id, isLoggedIn : 0});
            })(req,res,next);
        });

 // all are checking that the user is first logged in and then that he is of the right category that the request belong to.
    app.get('/user_request:id&:owner_id', general_functions.isLoggedInfunc, user_functions.request_this);
    app.get('/user_reset_password', general_functions.isLoggedInfunc, user_functions.get_reset_password);
    app.post('/user_reset_password', general_functions.isLoggedInfunc, user_functions.post_reset_password, user_functions.get_reset_password);
    app.get('/user_update_equipment:id',general_functions.isLoggedInfunc, user_functions.get_update_this_equipment);
    app.post('/user_update_equipment:id', general_functions.isLoggedInfunc, user_functions.post_update_this_equipment, general_functions.view);
    app.get('/user_my_equipment', general_functions.isLoggedInfunc,user_functions.my_equipment);
    app.get('/user_view_equipment', general_functions.isLoggedInfunc, user_functions.view_equipment);
    app.get('/user_add_equipment',general_functions.isLoggedInfunc, user_functions.check_profile, user_functions.get_add_equipment);
    app.get('/user_add_equipment_category', general_functions.isLoggedInfunc, user_functions.get_add_equipment_category);
    app.get('/user_add_equipment_subcategory', general_functions.isLoggedInfunc, user_functions.get_add_equipment_subcategory);
    app.get('/user_add_equipment_brand', general_functions.isLoggedInfunc, user_functions.get_add_equipment_brand);
    app.post('/user_add_equipment', general_functions.isLoggedInfunc, user_functions.post_add_equipment, user_functions.get_add_equipment);
    app.get('/user_update_profile',general_functions.isLoggedInfunc, user_functions.get_update_profile);
    app.post('/user_update_profile', general_functions.isLoggedInfunc, user_functions.post_update_profile);
    app.get('/user_logout',general_functions.isLoggedInfunc, general_functions.logoutfunc, general_functions.index);
    

// =======================================================================================
// =========================== ADMIN FUNCTIONS ====================================== 
// =======================================================================================

    app.get('/admin_login',function(req, res) {
        res.render('./admin_login.ejs', {msg :"Please login to continue"});
    });

    app.post('/admin_login', function(req, res, next){
         //call the local-login in ../config/passport.js
        passport.authenticate('local-admin_login', function (err, user, info) {
            // info is json given by passport.aunthicate
            //this function is called when LocalStrategy returns done function with parameters
            if(err) return res.render('./admin_login.ejs', {msg : 'Please Try Again!'});;    
            //if username or password doesn't match
            if(!user) return res.render('./admin_login.ejs', {msg: 'Please Try Again!'});  
            //this is when login is successful
            req.logIn(user, function(err) {
                if (err) return next(err); 
                else return next()
            });   
        })(req,res,next);
    }, admin_functions.home);

 // all are checking that the user is first logged in and then that he is of the right category that the request belong to.
    app.get('/admin', general_functions.isLoggedInfunc, admin_access, admin_functions.home);
    app.get('/admin_inquiry', general_functions.isLoggedInfunc, admin_access, admin_functions.inquiry);
    app.get('/admin_resolved:sno', general_functions.isLoggedInfunc, admin_access, admin_functions.resolved, admin_functions.inquiry);
    app.post('/admin_comment:sno', general_functions.isLoggedInfunc, admin_access, admin_functions.comment, admin_functions.inquiry);
    app.get('/admin_featured', general_functions.isLoggedInfunc, admin_access, admin_functions.featured_equip, admin_functions.feat_data, admin_functions.featured);
    app.get('/admin_view_details:id', general_functions.isLoggedInfunc,admin_access, user_functions.request_this);
    app.get('/admin_remove_featured:id',general_functions.isLoggedInfunc,admin_access,admin_functions.remove_featured,admin_functions.featured_equip, admin_functions.feat_data, admin_functions.featured);
    app.get('/admin_add_featured',general_functions.isLoggedInfunc,admin_access,admin_functions.featured_equip, admin_functions.feat_data ,admin_functions.available, admin_functions.get_add_featured);    
    app.get('/admin_add_this_featured:id',general_functions.isLoggedInfunc,admin_access, admin_functions.post_add_featured, admin_functions.featured_equip, admin_functions.feat_data, function(req,res,next){
        connection.query("SELECT equip_id FROM featured WHERE display = 1", function(err,rows){
            if(err) throw err;
            else if(rows.length == 3) admin_functions.featured(req,res);
            else next();
        });
    },admin_functions.available, admin_functions.get_add_featured);    
    app.get('/admin_view_equipment', general_functions.isLoggedInfunc,admin_access, admin_functions.available, admin_functions.view_equipment); 
    app.get('/admin_view_all_equipments', general_functions.isLoggedInfunc, admin_access, admin_functions.view_all_equipments);
    app.get('/admin_my_equipment', general_functions.isLoggedInfunc,admin_access,admin_functions.my_equipment);        
    app.get('/admin_add_equipment',general_functions.isLoggedInfunc,admin_access, admin_functions.get_add_equipment_user);
    app.post('/admin_add_equipment_reg', general_functions.isLoggedInfunc, admin_access, admin_functions.post_add_equipment_reg, admin_functions.get_add_equipment);
    app.post('/admin_add_equipment_new', general_functions.isLoggedInfunc, admin_access, function(req,res,next){
                passport.authenticate('local-signup', function (err, user, info) {
                //this function is called when LocalStrategy returns done function with parameters
                if(err) return next();    
                //if username or password doesn't match
                if(!user) return next();
                //this is when signup is successful
                else{ 
                    connection.query("SELECT id FROM account WHERE mobile = ?",[req.body.mobile], function(err1,rows1){
                        if(err1) throw err1;
                        else{
                            req.session.owner_id = rows1[0].id;
                            return admin_functions.get_add_equipment(req,res);
                        }
                    });
                }
            })(req,res,next);
    }, admin_functions.get_add_equipment_user);

    app.post('/admin_add_equipment', general_functions.isLoggedInfunc, admin_access, admin_functions.post_add_equipment, admin_functions.get_add_equipment);
    // app.get('/admin_add_new_admin', general_functions.isLoggedInfunc, admin_access, admin_functions.get_add_new_admin);
    // app.post('/admin_add_new_admin', general_functions.isLoggedInfunc, admin_access, admin_functions.post_add_new_admin);
    app.get("/admin_add_equipment_type",general_functions.isLoggedInfunc, admin_access,admin_functions.get_add_equipment_type);
    app.post("/admin_add_equipment_type",general_functions.isLoggedInfunc, admin_access, admin_functions.post_add_equipment_type, admin_functions.get_add_equipment_type);
    app.get("/admin_unavailable:id", general_functions.isLoggedInfunc, admin_access,admin_functions.unavailable,function(req,res,next){
        if(req.session.title == "My Equipments")admin_functions.my_equipment(req,res);
        else if(req.session.title == "All Equipments")admin_functions.view_all_equipments(req,res);
        else next();
    },admin_functions.available, admin_functions.view_equipment);
    app.get('/admin_views:equip_id', general_functions.isLoggedInfunc,admin_access, admin_functions.views);
    app.get('/admin_requests:equip_id', general_functions.isLoggedInfunc,admin_access, admin_functions.requests);
    app.get('/admin_reset_password', general_functions.isLoggedInfunc,admin_access, admin_functions.get_reset_password);
    app.post('/admin_reset_password', general_functions.isLoggedInfunc,admin_access, admin_functions.post_reset_password, admin_functions.home);
    app.get('/admin_update_equipment:id',general_functions.isLoggedInfunc,admin_access, admin_functions.get_update_this_equipment);
    app.post('/admin_update_equipment:id', general_functions.isLoggedInfunc,admin_access, admin_functions.post_update_this_equipment, function(req,res,next){
        if(req.session.title == "My Equipments")admin_functions.my_equipment(req,res);
        else if(req.session.title == "All Equipments")admin_functions.view_all_equipments(req,res);
        else next();
    },admin_functions.available, admin_functions.view_equipment);
    // app.get('/admin_update_profile',general_functions.isLoggedInfunc,admin_access, admin_functions.get_update_profile);
    // app.post('/admin_update_profile', general_functions.isLoggedInfunc,admin_access, admin_functions.post_update_profile);
    app.get('/admin_equipment_type_csv',general_functions.isLoggedInfunc, admin_access, admin_functions.get_equipment_type_csv);
    app.post('/admin_upload_type_csv',general_functions.isLoggedInfunc, admin_access, csv.type_csv, admin_functions.get_add_equipment_type);
    app.get('/admin_equipment_csv',general_functions.isLoggedInfunc, admin_access, admin_functions.get_equipment_csv);
    app.post('/admin_upload_equipment_csv', general_functions.isLoggedInfunc, admin_access,csv.equipment_csv, admin_functions.get_add_equipment_user);

};

var dealer_access = function access(req,res,next){
    if(req.session.category==2) return next();
    return res.render("Profiles/dealer/error.ejs");
}

var admin_access = function access(req,res,next){
    if(req.session.category==3) return next();
    return res.render("Profiles/dealer/error.ejs");
}

var dealer_user_access = function access(req,res,next){
    if(req.session.category==1 || req.session.category ==2) return next();
    return res.render("Profiles/dealer/error.ejs");
}    
