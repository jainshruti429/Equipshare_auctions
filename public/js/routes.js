// app/routes.js

// all the routes/request that are required in the server side.
// all request are handled here.

//load all the things needed.
var mysql = require('mysql');
var dbconfig = require('./config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var express  = require('express');
var app = express();
var path = require('path');
var fileUpload = require('express-fileupload');
app.use(express.static(path.join(__dirname,'/images')));
app.use(fileUpload());

// import functions from other files.
var general_functions = require('./app/general_functions') //common functions
var admin_functions = require('./app/admin_functions'); //admin side functions
var user_functions = require('./app/user_functions'); 


// =======================================================================================
// export all the routes
module.exports = function(app, passport) {

// =======================================================================================
// =========================== WITHOUT AUTHORISATION FUNCTIONS ====================================== 
// =======================================================================================

    //these functions do not require user to be logged in
    //HOME PAGE of website.... 
    app.get('/', general_functions.index);
    app.get('/featured/:id',general_functions.featured);
    app.post('/search',general_functions.search);
    app.get('/view/:id', general_functions.view);
    
   
// =======================================================================================
// =========================== USER FUNCTIONS ================================================== 
// =======================================================================================

    app.get('/login', function(req, res) {
        res.render('login.ejs', {msg:'Please Login to Continue'});    
    });

    app.post('/login', function(req, res, next){
        //call the local-login in ../config/passport.js
        passport.authenticate('local-login', function (err, user, info) {
            // info is json given by passport.aunthicate
            //this function is called when LocalStrategy returns done function with parameters
            if(err) res.render('./login.ejs', {msg : 'Please Try Again!'});;    
            //if username or password doesn't match
            if(!user) res.render('./login.ejs', {msg:info.message});  
            //this is when login is successful
            req.logIn(user, function(err) {
                if (err) return next(err); 
                else  res.render('./Profiles/user/homepage.ejs', {msg:('Welcome '+req.session.name)});
            });   
        })(req,res,next);
    });

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', {msg:'Please fill in following details'});
        });

    app.post('/signup', function(req, res, next){
            passport.authenticate('local-signup', function (err, user, info) {
                //this function is called when LocalStrategy returns done function with parameters
                if(err) res.render('signup.ejs', {msg : 'Please Try Again!'});    
                //if username or password doesn't match
                if(!user){                
                    return res.render('signup.ejs', {msg:info.message});
                }
                if (req.body.password != req.body.retype_password) return res.render('./signup.ejs',{msg:'passwords did not match'});
                if (!req.body.agree) return res.render('./signup.ejs',{msg:'You need to agree to TnC'});          
                //this is when signup is successful
                req.logIn(user, function(err) {
                    if (err) return next(err);
                    else return res.render('login.ejs', {msg:'SignUp successful! Please Login to Continue'}); //redirect to home for login.
                });
            })(req,res,next);
    });
 // all are checking that the user is first logged in and then that he is of the right category that the request belong to.
    app.get('/user/', general_functions.isLoggedInfunc, user_access, user_functions.home);
    app.get('/user/request/:id&:owner_id', general_functions.isLoggedInfunc, user_access,user_functions.request_this);
    app.get('/user/update_profile',general_functions.isLoggedInfunc, user_access, user_functions.get_update_profile);
    app.post('/user/update_profile', general_functions.isLoggedInfunc, user_functions.post_update_profile);
    
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
            if(!user) return res.render('./admin_login.ejs', {msg:info.message});  
            //this is when login is successful
            req.logIn(user, function(err) {
                if (err) return next(err); 
                else return res.render('./Profiles/admin/homepage.ejs', {msg:('Welcome '+req.session.name)});
            });   
        })(req,res,next);
    });

 // all are checking that the user is first logged in and then that he is of the right category that the request belong to.
    app.get('/admin/featured', general_functions.isLoggedInfunc, admin_access, admin_functions.featured);
    app.get('/admin/remove_featured/:id',general_functions.isLoggedInfunc,admin_access,admin_functions.remove_featured);
    app.get('/admin/add_featured',general_functions.isLoggedInfunc,admin_access,admin_functions.get_add_featured);
    app.get('/admin/add_featured/:id',general_functions.isLoggedInfunc,admin_access,admin_functions.post_add_featured);
    app.get('/admin/add_new_admin', general_functions.isLoggedInfunc, admin_access, admin_functions.get_add_new_admin);
    app.post('/admin/add_new_admin', general_functions.isLoggedInfunc, admin_access, admin_functions.post_add_new_admin);
    app.get('/admin/homepage', general_functions.isLoggedInfunc, admin_access, admin_functions.home);
    app.get("/admin/add_equipment_type",general_functions.isLoggedInfunc, admin_access,admin_functions.get_add_equipment_type);
	app.post("/admin/add_equipment_type",general_functions.isLoggedInfunc, admin_access, admin_functions.post_add_equipment_type);
    app.get('/admin/view_all_equipments', general_functions.isLoggedInfunc, admin_access, admin_functions.view_all_equipments);
    app.get("/admin/unavailable/:id", general_functions.isLoggedInfunc, admin_access,admin_functions.unavailable);
    app.get('/admin/views/:equip_id', general_functions.isLoggedInfunc,admin_access, general_functions.views);
    app.get('/admin/requests/:equip_id', general_functions.isLoggedInfunc,admin_access, general_functions.requests);
  

// =======================================================================================
// =========================== USER-ADMIN COMMON FUNCTIONS ====================================== 
// =======================================================================================

    //these function require user/admin to be logged in 
    app.get('/reset_password', general_functions.isLoggedInfunc, general_functions.get_reset_password);
    app.post('/reset_password', general_functions.isLoggedInfunc, general_functions.post_reset_password);
    app.get('/logout',general_functions.isLoggedInfunc, general_functions.logoutfunc);
    app.get('/update_equipment',general_functions.isLoggedInfunc, general_functions.get_update_equipment);
    app.get('/update_equipment/:id',general_functions.isLoggedInfunc, general_functions.get_update_this_equipment);
    app.post('/update_equipment/:id', general_functions.isLoggedInfunc, general_functions.post_update_this_equipment);
    app.get('/my_equipment', genera8jujjujujl_functions.isLoggedInfunc,general_functions.my_equipment);
    app.get('/view_equipment', general_functions.isLoggedInfunc, general_functions.view_equipment);
    app.get('/add_equipment',general_functions.isLoggedInfunc, general_functions.get_add_equipment);
    app.post('/add_equipment', general_functions.isLoggedInfunc, general_functions.post_add_equipment);

};

//__________________________________
//  logged in person category chart |
//     user     ==  1               |
//     admin    ==  0               |
//__________________________________|

// check if the the category of the client is admin i.e. 0
var admin_access = function access(req,res,next){
    if(req.session.category==0) return next();
    return res.render("error.ejs");
}

//general check if category is user or dealer
var user_access = function access(req,res,next){
    if(req.session.category==1) return next();
    return res.render("error.ejs");
}    

