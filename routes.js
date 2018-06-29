// app/routes.js

//load all the things needed.
var mysql = require('mysql');
var dbconfig = require('./config/database');
var connection = mysql.createConnection(dbconfig.connection);

//connection.query('USE ' + dbconfig.connection.database);


var express  = require('express');
var app = express();
var fileUpload = require('express-fileupload');
// app.use(express.static(path.join(__dirname,'/docs')));
// app.use(express.static(path.join(__dirname,'/images')));
// app.use(express.static(path.join(__dirname, "/public")));
// app.use(express.static(path.join(__dirname, "/")));
app.use(fileUpload());

// import functions from other files.
var gfunc = require('./app/general_functions') //common functions
var afunc = require('./app/admin_functions'); //admin side functions
var ufunc = require('./app/user_functions'); 
var csv = require('./app/csv');
//var func = require('./app/functions')

// ==========================================
module.exports = function(app, passport) {

    

    // PROFILE SECTION =====================
    // app.get('/profile/:id', func.isLoggedInfunc, func.profilefunc); // issLoggedIn verifies that user is authenticated

    // // LOGOUT ==============================
    // app.get('/logout', func.logoutfunc);
    // // =====================================

    // app.get('/dashboard', func.isLoggedInfunc, func.dashboard);

    // app.get('/wallet',func.isLoggedInfunc, func.walletfunc);

    // //this is post for forgot password which requires user's email id
    // app.post('/forgot', func.forgot);

    // //this route will verify the password token hasn't expire and returns a json response
    // app.get('/reset/:token', func.reset_pass);

    // //POST for password reset and if token hasn't expired, the password of user is reset.
    // app.post('/reset/:token', func.reset_pass_post_form);

    // app.post('/add_to_likes', func.isLoggedInfunc, dealer_user_access, func.add_to_likes);

    // app.post('/search_suggestions', func.isLoggedInfunc, dealer_user_access, func.search_suggestions);

    // app.post('/search', func.isLoggedInfunc, dealer_user_access, func.search);

    // app.get('/my_likes', func.isLoggedInfunc, dealer_user_access, func.my_likes);    

    //  app.get('/show_car/:id', func.isLoggedInfunc, func.show_car);

    // //================================================================================
    // //======================= ADMIN ROUTES ===========================================
    // //================================================================================


    // app.post('/admin/new_location', func.isLoggedInfunc, admin_access, func_admin.add_new_location);
    // app.get('/admin/existing_location', func.isLoggedInfunc, admin_access, func_admin.existing_location);
    // app.get('/admin/existing_user', func.isLoggedInfunc, admin_access, func_admin.existing_user);
    // app.get('/admin/add_new_admin', func.isLoggedInfunc, admin_access, func_admin.add_new_admin);
    // app.post('/admin/add_new_admin', func.isLoggedInfunc, admin_access, func_admin.add_new_admin_post_form);
    // app.post('/admin/add_new_equipment', func.isLoggedInfunc, admin_access, func_admin.add_new_equipment_post_form);
    // app.post('/admin/add_new_auction', func.isLoggedInfunc, admin_access, func_admin.add_new_auction_post_form);

    // app.get('/existing_dealers', func.isLoggedInfunc, func.existing_dealers);    //common for admin and dealer

    // app.post('/admin/enquiry_form', func.isLoggedInfunc, admin_access, func_admin.enquiry_form_post_form);
    // app.post('/admin/change_time', func.isLoggedInfunc, admin_access, func_admin.change_time);
    // app.get('/pending_request', func.isLoggedInfunc, admin_access, func_admin.pending_request);
    // app.post('/verified', func.isLoggedInfunc, admin_access, func_admin.verified);

    // //================================================================================
    // //======================= DEALER ROUTES + USER ROUTES ============================
    // //================================================================================

    // app.get('/dealer/complete_profile', func.isLoggedInfunc, dealer_access, func_dealer.complete_profile);
    // app.post('/dealer/complete_profile', func.isLoggedInfunc,  dealer_access, func_dealer.complete_profile_post_form);
    // app.get('/add_car', func.isLoggedInfunc, dealer_user_access, func.add_car); 
    // app.post('/add_car', func.isLoggedInfunc, dealer_user_access,  func.add_car_post_form);
    // app.get('/dealer_my_equipment', func.isLoggedInfunc, dealer_user_access,  func.dealer_my_equipment); 
    // app.post('/change_auction_status', func.isLoggedInfunc, dealer_user_access,  func.change_auction_status);
    // app.get('/dealer/dealer_purchase', func.isLoggedInfunc, dealer_access,  func_dealer.dealer_purchase);
    // app.post('/dealer/dealer_purchase',func.isLoggedInfunc, dealer_access,  func_dealer.dealer_purchase_post_form);
    // app.get('/dealer/dealer_sell', func.isLoggedInfunc, dealer_access,  func_dealer.dealer_sell);
    // app.post('/dealer/dealer_sell', func.isLoggedInfunc, dealer_access,  func_dealer.dealer_sell_post_form);
    // app.get('/dealer/sell_lead', func.isLoggedInfunc, dealer_access, func_dealer.sell_lead);
    // app.post('/dealer/schedule', func.isLoggedInfunc, dealer_access, func_dealer.schedule);
    // app.get('dealer//my_schedule', func.isLoggedInfunc, dealer_access, func_dealer.my_schedule);

    // app.get('/next_auction', func.isLoggedInfunc, dealer_user_access,  func.next_auction);
    // app.get('/my_bids', func.isLoggedInfunc, dealer_user_access,  func.my_bids);


    // //app.get('/deal', 
    // app.post('/add_new_bid', func.isLoggedInfunc,dealer_user_access, func.add_new_bid);

// =======================================================================================
// =========================== WITHOUT AUTHORISATION FUNCTIONS ====================================== 
// =======================================================================================

    //these functions do not require user to be logged in
    //HOME PAGE of website.... 

    app.get('/', gfunc.home);
    app.get('/beta', gfunc.beta_home);
    app.get('/new', gfunc.new_home);
    app.post('/featured:id',gfunc.featured);
    app.get('/search_category', gfunc.search_category);
    app.post('/search',gfunc.search);
    app.post('/new_search',gfunc.search);
    app.post('/view:id', gfunc.view);
    app.get('/view:id', gfunc.view);
    app.post('/email', gfunc.email, gfunc.home);
    app.get('/compare',gfunc.compare );
    app.get('/compare_now', gfunc.compare_now);
    
    
// =======================================================================================
// =========================== USER FUNCTIONS ================================================== 
// =======================================================================================
    app.get('/login:id', gfunc.login);
    
    app.post('/user_login:id', function(req, res, next){
            //call the local-login in ../config/passport.js
            passport.authenticate('local-user-login', function (err, user, info) {
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
            else return gfunc.home(req,res);
        }, gfunc.view);

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
    app.get('/user_save_search', gfunc.isLoggedInfunc, ufunc.save_search);
    app.get('/user_dashboard', gfunc.isLoggedInfunc, ufunc.dashboard);
    app.get("/user_saved_searches", gfunc.isLoggedInfunc, ufunc.saved_searches);
    app.get("/user_my_requests", gfunc.isLoggedInfunc, ufunc.my_requests1, ufunc.my_requests2, ufunc.my_requests3);

    app.get('/user_request:id', gfunc.isLoggedInfunc, ufunc.request_this);
    app.get('/user_reset_password', gfunc.isLoggedInfunc, ufunc.get_reset_password);
    app.post('/user_reset_password', gfunc.isLoggedInfunc, ufunc.post_reset_password, ufunc.get_reset_password);
    app.get('/user_update_equipment:id',gfunc.isLoggedInfunc, ufunc.get_update_this_equipment);
    app.post('/user_update_equipment:id', gfunc.isLoggedInfunc, ufunc.post_update_this_equipment, gfunc.view);
    app.get('/user_my_equipment', gfunc.isLoggedInfunc,ufunc.my_equipment);
    app.get('/user_view_equipment', gfunc.isLoggedInfunc, ufunc.view_equipment);
    app.get('/user_add_equipment',gfunc.isLoggedInfunc, ufunc.check_profile, ufunc.get_add_equipment);
    app.get('/user_add_equipment_category', gfunc.isLoggedInfunc, ufunc.get_add_equipment_category);
    app.get('/user_add_equipment_subcategory', gfunc.isLoggedInfunc, ufunc.get_add_equipment_subcategory);
    app.get('/user_add_equipment_brand', gfunc.isLoggedInfunc, ufunc.get_add_equipment_brand);
    app.post('/user_add_equipment', gfunc.isLoggedInfunc, ufunc.post_add_equipment, ufunc.get_add_equipment);
    app.get('/user_update_profile',gfunc.isLoggedInfunc, ufunc.get_update_profile);
    app.post('/user_update_profile', gfunc.isLoggedInfunc, ufunc.post_update_profile);
    app.get('/user_logout',gfunc.isLoggedInfunc, gfunc.logoutfunc, gfunc.home);
    

// =======================================================================================
// =========================== ADMIN FUNCTIONS ====================================== 
// =======================================================================================

    app.get('/admin',function(req, res) {
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
    }, afunc.home);

 // all are checking that the user is first logged in and then that he is of the right category that the request belong to.
    app.get('/admin', gfunc.isLoggedInfunc, admin_access, afunc.home);
    app.get('/admin_inquiry', gfunc.isLoggedInfunc, admin_access, afunc.inquiry);
    app.get('/admin_resolved:sno', gfunc.isLoggedInfunc, admin_access, afunc.resolved, afunc.inquiry);
    app.post('/admin_comment:sno', gfunc.isLoggedInfunc, admin_access, afunc.comment, afunc.inquiry);
    app.get('/admin_featured', gfunc.isLoggedInfunc, admin_access, afunc.featured_equip, afunc.feat_data, afunc.featured);
    app.get('/admin_view_details:id', gfunc.isLoggedInfunc,admin_access, ufunc.request_this);
    app.get('/admin_remove_featured:id',gfunc.isLoggedInfunc,admin_access,afunc.remove_featured,afunc.featured_equip, afunc.feat_data, afunc.featured);
    app.get('/admin_add_featured',gfunc.isLoggedInfunc,admin_access,afunc.featured_equip, afunc.feat_data ,afunc.available, afunc.get_add_featured);    
    app.get('/admin_add_this_featured:id',gfunc.isLoggedInfunc,admin_access, afunc.post_add_featured, afunc.featured_equip, afunc.feat_data, function(req,res,next){
        connection.query("SELECT equip_id FROM featured WHERE display = 1", function(err,rows){
            if(err) throw err;
            else if(rows.length == 3) afunc.featured(req,res);
            else next();
        });
    },afunc.available, afunc.get_add_featured);    
    app.get('/admin_view_equipment', gfunc.isLoggedInfunc,admin_access, afunc.available, afunc.view_equipment); 
    app.get('/admin_view_all_equipments', gfunc.isLoggedInfunc, admin_access, afunc.view_all_equipments);
    app.get('/admin_my_equipment', gfunc.isLoggedInfunc,admin_access,afunc.my_equipment);        
    app.get('/admin_add_equipment',gfunc.isLoggedInfunc,admin_access, afunc.get_add_equipment_user);
    app.post('/admin_add_equipment_reg', gfunc.isLoggedInfunc, admin_access, afunc.post_add_equipment_reg, afunc.get_add_equipment);
    app.post('/admin_add_equipment_new', gfunc.isLoggedInfunc, admin_access, function(req,res,next){
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
                            return afunc.get_add_equipment(req,res);
                        }
                    });
                }
            })(req,res,next);
    }, afunc.get_add_equipment_user);

    app.post('/admin_add_equipment', gfunc.isLoggedInfunc, admin_access, afunc.post_add_equipment, afunc.get_add_equipment);
    // app.get('/admin_add_new_admin', gfunc.isLoggedInfunc, admin_access, afunc.get_add_new_admin);
    // app.post('/admin_add_new_admin', gfunc.isLoggedInfunc, admin_access, afunc.post_add_new_admin);
    app.get("/admin_add_equipment_type",gfunc.isLoggedInfunc, admin_access,afunc.get_add_equipment_type);
    app.post("/admin_add_equipment_type",gfunc.isLoggedInfunc, admin_access, afunc.post_add_equipment_type, afunc.get_add_equipment_type);
    app.get("/admin_unavailable:id", gfunc.isLoggedInfunc, admin_access,afunc.unavailable,function(req,res,next){
        if(req.session.title == "My Equipments")afunc.my_equipment(req,res);
        else if(req.session.title == "All Equipments")afunc.view_all_equipments(req,res);
        else next();
    },afunc.available, afunc.view_equipment);
    app.get('/admin_views:equip_id', gfunc.isLoggedInfunc,admin_access, afunc.views);
    app.get('/admin_requests:equip_id', gfunc.isLoggedInfunc,admin_access, afunc.requests);
    app.get('/admin_reset_password', gfunc.isLoggedInfunc,admin_access, afunc.get_reset_password);
    app.post('/admin_reset_password', gfunc.isLoggedInfunc,admin_access, afunc.post_reset_password, afunc.home);
    app.get('/admin_update_equipment:id',gfunc.isLoggedInfunc,admin_access, afunc.get_update_this_equipment);
    app.post('/admin_update_equipment:id', gfunc.isLoggedInfunc,admin_access, afunc.post_update_this_equipment, function(req,res,next){
        if(req.session.title == "My Equipments")afunc.my_equipment(req,res);
        else if(req.session.title == "All Equipments")afunc.view_all_equipments(req,res);
        else next();
    },afunc.available, afunc.view_equipment);
    // app.get('/admin_update_profile',gfunc.isLoggedInfunc,admin_access, afunc.get_update_profile);
    // app.post('/admin_update_profile', gfunc.isLoggedInfunc,admin_access, afunc.post_update_profile);
    app.get('/admin_equipment_type_csv',gfunc.isLoggedInfunc, admin_access, afunc.get_equipment_type_csv);
    app.post('/admin_upload_type_csv',gfunc.isLoggedInfunc, admin_access, csv.type_csv, afunc.get_add_equipment_type);
    app.get('/admin_equipment_csv',gfunc.isLoggedInfunc, admin_access, afunc.get_equipment_csv);
    app.post('/admin_upload_equipment_csv', gfunc.isLoggedInfunc, admin_access,csv.equipment_csv, afunc.get_add_equipment_user);
    
    app.get('/admin_show_requests', gfunc.isLoggedInfunc, admin_access, afunc.show_requests);
    app.get('/admin_saved_searches', gfunc.isLoggedInfunc, admin_access, afunc.saved_searches);

// =======================================================================================
// =========================== COMPANY USER FUNCTIONS ====================================== 
// =======================================================================================

	app.get('/company',function(req, res) {
        res.render('./company_login.ejs', {msg :"Please login to continue"});
    });

    app.post('/company_login', function(req, res, next){
         //call the local-login in ../config/passport.js
        passport.authenticate('local-company-login', function (err, user, info) {
            // info is json given by passport.aunthicate
            //this function is called when LocalStrategy returns done function with parameters
            if(err) return res.render('./company_login.ejs', {msg : 'Please Try Again!'});;    
            //if username or password doesn't match
            if(!user) return res.render('./company_login.ejs', {msg: 'Please Try Again!'});  
            //this is when login is successful
            req.logIn(user, function(err) {
                if (err) return next(err); 
                else return next()
            });   
        })(req,res,next);
    }, cfunc.home);

    
	
	//see views
	//see saved searches
	//see requests/leads
	//add proposal

// =======================================================================================
// =========================== BANK USER FUNCTIONS ====================================== 
// =======================================================================================
	//see deals (approved by admin) 
	//add proposal

};

//-------------------------------------------------------
			// Admin = 0
			// SA = 9
			// Company Admin/User = 4
			// Dealer Admin = 3
			// Dealer User = 2
			// User/Customer = 1
			// Bank User = 5;
			// Other = 6;
//--------------------------------------------------------

// var dealer_access = function access(req,res,next){
//     if(req.session.category==2) return next();
//     return res.render("./error.ejs");
// }

var admin_access = function access(req,res,next){
    if(req.session.category==0) return next();
    return res.render("./error.ejs");
}

// var dealer_user_access = function access(req,res,next){
//     if(req.session.category==0 || req.session.category ==2) return next();
//     return res.render("Profiles/dealer/error.ejs");
// }    
