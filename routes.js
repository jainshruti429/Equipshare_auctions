
//load all the things needed.
 var mysql = require('mysql');
 var dbconfig = require('./config/database');
 var connection = mysql.createConnection(dbconfig.connection);

// connection.query('USE ' + dbconfig.connection.database);


var express  = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var path = require('path');
app.use(express.static(path.join(__dirname,'/docs')));
app.use(express.static(path.join(__dirname,'/images')));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/")));
app.use(express.static(path.join(__dirname, "/arishconflicts")));
app.use(fileUpload());

// import functions from other files.
var gfunc = require('./app/general_functions') //common functions
var afunc = require('./app/admin_functions'); //admin side functions
var ufunc = require('./app/user_functions'); 
// var csv = require('./app/csv');
// var cfunc = require('./app/company_functions');
//var func = require('./app/functions')

// ==========================================

module.exports = function(app, passport) {
    
// =======================================================================================
// =========================== COMMON FUNCTIONS ====================================== 
// =======================================================================================

    //these functions do not require user to be logged in
    //HOME PAGE of website.... 
    app.get('/logout',gfunc.isLoggedInfunc, gfunc.logoutfunc);
//     //$$if admin access this give option of user_profile instead of request
    app.get('/view:id',gfunc.isLoggedInfunc, gfunc.view1,gfunc.view2);
    
    
// // =======================================================================================
// // =========================== USER FUNCTIONS ================================================== 
// // =======================================================================================
//     //TBD .... url depends on front end linking

    app.get('/', function(req,res){
    	res.render('./user_split_screen.ejs');
    });

    app.get('/buy_sell', gfunc.login);
    app.get('/user_login', gfunc.login);
    
    app.post('/user_login', function(req, res, next){
            //call the local-login in ../config/passport.js
        passport.authenticate('local-user-login', function (err, user, info) {
            // info is json given by passport.aunthicate
            //this function is called when LocalStrategy returns done function with parameters
            if(err) 
                return res.render('./user_login.ejs', {msg : 'Please Try Again!', login_para : 1});    
            //if username or password doesn't match
            if(!user) return res.render('./user_login.ejs', {msg: 'Please Try Again!', login_para : 1});  
            //this is when login is successful
            req.logIn(user, function(err) {
                if (err) return res.render('./user_login.ejs', {msg : 'Please Try Again!', login_para : 1}); 
                else  return next();
            });   
        })(req,res,next);
    }, ufunc.dashboard);
        // function(req,res,next){
        //     if(req.params.id != 0) return next();
        //     else return gfunc.home(req,res);
        // }, gfunc.view);

    app.post('/user_signup', function(req, res, next){
        passport.authenticate('local-signup', function (err, user, info) {
            //this function is called when LocalStrategy returns done function with parameters
            if(err) return res.render('./user_login.ejs', {msg : 'Please Try Again!', login_para:0});    
            //if username or password doesn't match
            if(!user) return res.render('./user_login.ejs', {msg:info.message,  login_para:0});
            if (req.body.password != req.body.retype_password) return res.render('./user_login.ejs',{msg:'passwords did not match', login_para:0});
            //if (!req.body.agree) return res.render('./user_signup.ejs',{msg:'You need to agree to TnC'});          
            //this is when signup is successful
            else return res.render('./user_login.ejs',{msg:'Signup successful! Login to continue', login_para:1});
        })(req,res,next);
    });
//  // all are checking that the user is first logged in and then that he is of the right category that the request belong to.
    app.get("/user_dashboard", gfunc.isLoggedInfunc, ufunc.dashboard);
//     //links from dashboard
    app.get('/user_search_category', gfunc.isLoggedInfunc,ufunc.search_category);
    app.post('/user_search',gfunc.isLoggedInfunc,ufunc.search);
//     //links from side_nav_bar
//     //Equipments
    app.get("/user_my_requests", gfunc.isLoggedInfunc, ufunc.my_requests0,ufunc.my_requests1, ufunc.my_requests2, ufunc.my_requests3, ufunc.my_requests4, ufunc.my_requests5);
    app.get('/user_my_equipment', gfunc.isLoggedInfunc,ufunc.my_equipment1,gfunc.equip_data,ufunc.my_equipment2 );
    app.get('/user_add_equipment',gfunc.isLoggedInfunc, ufunc.check_profile, ufunc.get_add_equipment);
    app.get("/user_saved_searches", gfunc.isLoggedInfunc, ufunc.saved_searches);
//     //Auction
    app.get("/user_upcoming_auctions",gfunc.isLoggedInfunc,ufunc.upcoming_auctions);
    app.get("/user_live_auction",gfunc.isLoggedInfunc,ufunc.live_auction,ufunc.upcoming_auctions);
    app.get("/user_auction_results", gfunc.isLoggedInfunc, afunc.show_auctions);
//     //app.get("/this_auction_result:id", gfunc.isLoggedInfunc,);
//     //links from header dropdown - logout is a common function
    app.get('/user_update_profile',gfunc.isLoggedInfunc, ufunc.get_update_profile);
    app.post('/user_update_profile', gfunc.isLoggedInfunc, ufunc.post_update_profile);

    app.get('/user_compare',gfunc.isLoggedInfunc,ufunc.compare);
//     // app.get('/user_compare_now', gfunc.isLoggedInfunc,ufunc.compare_now);
    app.get('/user_save_search', gfunc.isLoggedInfunc, ufunc.save_search);    
    app.get('/user_request:id', gfunc.isLoggedInfunc, ufunc.request_this);
//     // app.post("/user_proposal_status", gfunc.isLoggedInfunc,ufunc.change_proposal_status);    
   
    app.get('/user_reset_password', gfunc.isLoggedInfunc, ufunc.get_reset_password);
    app.post('/user_reset_password', gfunc.isLoggedInfunc, ufunc.post_reset_password, ufunc.get_reset_password);
    app.get('/user_update_equipment:id',gfunc.isLoggedInfunc, ufunc.get_update_this_equipment);
    app.post('/user_update_equipment:id', gfunc.isLoggedInfunc, ufunc.post_update_this_equipment,gfunc.view1,gfunc.view2);
//     // //app.get('/user_view_equipment', gfunc.isLoggedInfunc, ufunc.view_equipment);
    app.get('/user_add_equipment_category', gfunc.isLoggedInfunc, ufunc.get_add_equipment_category);
    app.get('/user_add_equipment_subcategory', gfunc.isLoggedInfunc, ufunc.get_add_equipment_subcategory);
    app.get('/user_add_equipment_brand', gfunc.isLoggedInfunc, ufunc.get_add_equipment_brand);
    // app.post('/user_add_equipment', gfunc.isLoggedInfunc, ufunc.post_add_equipment, ufunc.get_add_equipment);
// //     // 
    
// // // =======================================================================================
// // // =========================== ADMIN FUNCTIONS ====================================== 
// // // =======================================================================================

    app.get('/admin_login',function(req, res) {
        res.render('./admin_login.ejs', {msg :"Please login to continue"});
    });

    app.post('/admin', function(req, res, next){
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
                else return next();
            });   
        })(req,res,next);
    }, afunc.home);

// //  // all are checking that the user is first logged in and then that he is of the right category that the request belong to.
    app.get('/admin', gfunc.isLoggedInfunc, admin_access, afunc.home);
// //     app.get('/admin_inquiry', gfunc.isLoggedInfunc, admin_access, afunc.inquiry);
// //     //app.get('/admin_resolved:sno', gfunc.isLoggedInfunc, admin_access, afunc.resolved, afunc.inquiry);
// //     app.post('/admin_comment:sno', gfunc.isLoggedInfunc, admin_access, afunc.comment, afunc.inquiry);
//     app.get('/admin_featured', gfunc.isLoggedInfunc, admin_access, afunc.featured_equip, gfunc.equip_data, afunc.featured);
// //     app.get('/admin_view_details:id', gfunc.isLoggedInfunc,admin_access, ufunc.request_this);
//     app.get('/admin_remove_featured:id',gfunc.isLoggedInfunc,admin_access,afunc.remove_featured,afunc.featured_equip, gfunc.equip_data, afunc.featured);
//     app.get('/admin_add_featured',gfunc.isLoggedInfunc,admin_access,afunc.featured_equip, gfunc.equip_data ,afunc.available, afunc.get_add_featured);    
//     app.get('/admin_add_this_featured:id',gfunc.isLoggedInfunc,admin_access, afunc.post_add_featured, afunc.featured_equip, afunc.feat_data, function(req,res,next){
//         connection.query("SELECT equip_id FROM featured WHERE display = 1", function(err,rows){
//             if(err) throw err;
//             else if(rows.length == 3) afunc.featured(req,res);
//             else next();
//         });
//     },afunc.available, afunc.get_add_featured);    
//     //$$render dynamic table
//     //$$gfunc.equip_data
//     app.get('/admin_view_equipment', gfunc.isLoggedInfunc,admin_access, afunc.available, afunc.view_equipment); 
    app.get('/admin_view_all_equipments', gfunc.isLoggedInfunc, admin_access, afunc.view_all_equipments);
    app.get('/admin_my_equipment', gfunc.isLoggedInfunc,admin_access,afunc.my_equipment);        
//     app.get('/admin_add_equipment',gfunc.isLoggedInfunc,admin_access, afunc.get_add_equipment_user);
//     app.post('/admin_add_equipment_reg', gfunc.isLoggedInfunc, admin_access, afunc.post_add_equipment_reg, afunc.get_add_equipment);
//     app.post('/admin_add_equipment_new', gfunc.isLoggedInfunc, admin_access, function(req,res,next){
//                 passport.authenticate('local-signup', function (err, user, info) {
//                 //this function is called when LocalStrategy returns done function with parameters
//                 if(err) return next();    
//                 //if username or password doesn't match
//                 if(!user) return next();
//                 //this is when signup is successful
//                 else{ 
//                     connection.query("SELECT id FROM account WHERE mobile = ?",[req.body.mobile], function(err1,rows1){
//                         if(err1) throw err1;
//                         else{
//                             req.session.owner_id = rows1[0].id;
//                             return afunc.get_add_equipment(req,res);
//                         }
//                     });
//                 }
//             })(req,res,next);
//     }, afunc.get_add_equipment_user);

//     app.post('/admin_add_equipment', gfunc.isLoggedInfunc, admin_access, afunc.post_add_equipment, afunc.get_add_equipment);
//     //$$page may not be designed
    app.get('/admin_add_new_admin', gfunc.isLoggedInfunc, admin_access, afunc.get_add_new_admin);
    app.post('/admin_add_new_admin', gfunc.isLoggedInfunc, admin_access, afunc.post_add_new_admin);
    

//     app.get("/admin_add_equipment_type",gfunc.isLoggedInfunc, admin_access,afunc.get_add_equipment_type);
//     app.post("/admin_add_equipment_type",gfunc.isLoggedInfunc, admin_access, afunc.post_add_equipment_type, afunc.get_add_equipment_type);
//     //$$change status
//     // app.get("/admin_unavailable:id", gfunc.isLoggedInfunc, admin_access,afunc.unavailable,function(req,res,next){
//     //     if(req.session.title == "My Equipments")afunc.my_equipment(req,res);
//     //     else if(req.session.title == "All Equipments")afunc.view_all_equipments(req,res);
//     //     else next();
//     // },afunc.available, afunc.view_equipment);
// //     app.post('/admin_reset_password', gfunc.isLoggedInfunc,admin_access, afunc.post_reset_password, afunc.home);
// //     app.get('/admin_update_equipment:id',gfunc.isLoggedInfunc,admin_access, afunc.get_update_this_equipment);
// //     app.post('/admin_update_equipment:id', gfunc.isLoggedInfunc,admin_access, afunc.post_update_this_equipment, function(req,res,next){
// //         if(req.session.title == "My Equipments")afunc.my_equipment(req,res);
// //         else if(req.session.title == "All Equipments")afunc.view_all_equipments(req,res);
// //         else next();
// //     },afunc.available, afunc.view_equipment);
// //     // app.get('/admin_update_profile',gfunc.isLoggedInfunc,admin_access, afunc.get_update_profile);
// //     // app.post('/admin_update_profile', gfunc.isLoggedInfunc,admin_access, afunc.post_update_profile);
// //     app.get('/admin_equipment_type_csv',gfunc.isLoggedInfunc, admin_access, afunc.get_equipment_type_csv);
// //     app.post('/admin_upload_type_csv',gfunc.isLoggedInfunc, admin_access, csv.type_csv, afunc.get_add_equipment_type);
// //     app.get('/admin_equipment_csv',gfunc.isLoggedInfunc, admin_access, afunc.get_equipment_csv);
// //     app.post('/admin_upload_equipment_csv', gfunc.isLoggedInfunc, admin_access,csv.equipment_csv, afunc.get_add_equipment_user);
    
// //     app.get('/admin_show_requests', gfunc.isLoggedInfunc, admin_access, afunc.show_requests);
       app.get('/admin_saved_searches', gfunc.isLoggedInfunc, admin_access, afunc.saved_searches);
// //     app.get('/admin_enquiry', gfunc.isLoggedInfunc, admin_access, afunc.inEmail);
		
       // app.get('/admin_show_master',gfunc.isLoggedInfunc, admin_access,afunc.show_master);
       // app.get('/admin_update_master',gfunc.isLoggedInfunc, admin_access,afunc.get_update_master);
       // app.post('/admin_post_update_master',gfunc.isLoggedInfunc, admin_access,afunc.post_update_master,afunc.show_master);
       app.get('/admin_showuserprofile:id',gfunc.isLoggedInfunc, admin_access,afunc.show_user_profile1,ufunc.my_requests1,ufunc.my_requests2,ufunc.my_requests3,afunc.show_user_profile2);
       app.get('/admin_show_user',gfunc.isLoggedInfunc, admin_access,afunc.show_user);
       app.get('/admin_upcoming_auction',gfunc.isLoggedInfunc,admin_access,afunc.upcoming_auctions);
       app.get('/get_sch_auc',gfunc.isLoggedInfunc,admin_access,afunc.get_schedule_auction);
       app.post('/add_to_auc',gfunc.isLoggedInfunc,admin_access,afunc.post_schedule_auction1,afunc.post_schedule_auction2);
       app.get('/admin_add_equipment_type',gfunc.isLoggedInfunc,admin_access,afunc.get_add_equipment_type);
       app.get('/admin_add_equipment_master',gfunc.isLoggedInfunc,admin_access,afunc.get_add_equipment_master);
       app.post('/admin_add_equipment_master',gfunc.isLoggedInfunc,admin_access,afunc.add_master);
       app.get('/get_add_equipment',gfunc.isLoggedInfunc,admin_access,afunc.get_add_equipment);
       app.get('/admin_my_equipment',gfunc.isLoggedInfunc,admin_access,afunc.my_equipment);
// // =======================================================================================
// // =========================== COMPANY USER FUNCTIONS ====================================== 
// // =======================================================================================

// 	app.get('/company_login',function(req, res) {
// 		if(isLoggedIn(req,res)) return next();
// 		else return res.render('./company_login.ejs', {msg :"Please login to continue"});
//     }, cfunc.home);

//     app.post('/company_login', function(req, res, next){
//          //call the local-login in ../config/passport.js
//         passport.authenticate('local-company-login', function (err, user, info) {
//             // info is json given by passport.aunthicate
//             //this function is called when LocalStrategy returns done function with parameters
//             if(err) return res.render('./company_login.ejs', {msg : 'Please Try Again!'});;    
//             //if username or password doesn't match
//             if(!user) return res.render('./company_login.ejs', {msg: 'Please Try Again!'});  
//             //this is when login is successful
//             req.logIn(user, function(err) {
//                 if (err) return next(err); 
//                 else return next()
//             });   
//         })(req,res,next);
//     }, cfunc.home);



    
	

// 	//see views
// 	//see saved searches
// 	//see requests/leads
// 	//add proposal

// // =======================================================================================
// // =========================== BANK USER FUNCTIONS ====================================== 
// // =======================================================================================
// 	//see deals (approved by admin) 
//     //add proposal

// 	see views
// 	see saved searches
// 	see requests/leads
// 	add proposal

// =======================================================================================
// =========================== BANK USER FUNCTIONS ====================================== 
// =======================================================================================
// 	see deals (approved by admin) 
//     add proposal
    

};

// //-------------------------------------------------------
// 			// Admin = 0
// 			// SA = 9
// 			// Company = 4
// 			// Dealer= 2
// 			// User =1
// 			// Bank/Financer = 5;
// 			// Other = 6;
// //--------------------------------------------------------

// // var dealer_access = function access(req,res,next){
// //     if(req.session.category==2) return next();
// //     return res.render("./error.ejs");
// // }

// var isLoggedIn = function(req, res) {  
//         var x ;
//         if (req.isAuthenticated()) x=1;
//         else x = 0;
//         return x;
// };



var admin_access = function(req,res,next){

    if(req.session.category==0){  return next();}
    else return res.render("./error.ejs");
};


// // var dealer_user_access = function access(req,res,next){
// //     if(req.session.category==0 || req.session.category ==2) return next();
// //     return res.render("Profiles/dealer/error.ejs");
// // } 
 


