
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
	// app.get('/', function(req,res){
	// 	var str = "678!#%ghh!#%ghjg!#%ghjv!#%fy!#%vh!#%vg!#%!#%";
	// 	var arr = str.split("!#%");
	// 	res.send(arr);

	// });

    // app.get('/', function(req,res, next){
    //         featured = [];
    //         prev_featured = [];
    //         feat_details = [];
    //         str1 = "SELECT featured.equip_id,featured.views, featured.start_date, featured.end_date, featured.display,all_equipment.photo1, all_equipment.expected_price, all_equipment.subcategory, all_equipment.brand, all_equipment.model, all_equipment.owner_id FROM all_equipment INNER JOIN featured ON featured.equip_id = all_equipment.id";
    //         connection.query(str1, function(err,rows){
    //             if(err) throw err;
    //             else{
    //                 for(var i = 0; i<rows.length; i++){
    //                     if(rows[i].display) featured.push(rows[i]);
    //                     else prev_featured.push(rows[i]);
    //                 }
    //                 str = "SELECT name, address1, address2, address3, city, state, zipcode, mobile FROM account WHERE id IN (";
    //                 for(var i = 0; i <featured.length; i++){
    //                     str = str + featured[i].owner_id + ",";
    //                 }
    //                 str = str.slice(0,-1);
    //                 str = str +")";
    //                 connection.query(str, function(err2,rows2){
    //                     if(err2) throw err2;
    //                     else{
    //                         if(rows2.length == featured.length) feat_details = rows2;
    //                         else if(rows2.length == 1){
    //                              for(var i = 0 ; i < 3 ; i++){
    //                                 feat_details[i] = rows2[0];
    //                             }
    //                         } 
    //                         else{
    //                             if(featured[0].owner_id == featured[1].owner_id){
    //                                 feat_details[0] = rows2[0];
    //                                 feat_details[1] = rows2[0];
    //                                 feat_details[2] = rows2[1];
    //                             }
    //                             if(featured[1].owner_id == featured[2].owner_id){
    //                                 feat_details[0] = rows2[0];
    //                                 feat_details[1] = rows2[1];
    //                                 feat_details[2] = rows2[1];   
    //                             }
    //                             if(featured[0].owner_id == featured[2].owner_id){
    //                                 feat_details[0] = rows2[0];
    //                                 feat_details[1] = rows2[1];
    //                                 feat_details[2] = rows2[0];   
    //                             }
    //                         }
    //                         return next();
    //                     }
    //                 });
    //             }
    //         });
    //     },
    //   function(req,res){
    //       feat_data = [];
    //       data = {views:0,
    //         requests:7};
    //       for(var i = 0;i<featured ;i++){
    //           feat_data.push(data);
    //       }

    //     //res.render("./user_equipmentDetail.ejs",{username:'',request:1,equip,prev_featured:prev_featured,featured:featured, feat_data : feat_data,cat_rows:[2] ,user_data:[] })
    //     res.render("./user_dashboard.ejs",{username:'',prev_featured:prev_featured,featured:featured, feat_data : feat_data,cat_rows:[2] });

    // });

    // app.get('/', function(req,res){
    //     connection.query("SELECT * FROM all_equipment WHERE id = 42",function(err,rows){
    //         if(err) throw err;
    //         else {
    //             connection.query("SELECT * FROM equipment_type WHERE type_id = ?",[rows[0].type_id], function(err1,rows1){
    //                 if(err1) throw err1;
    //                 else res.render("./Admin_EquipmentMaster.ejs", {new_equip:[],used_equip:[],user_data:[],category:1,username:'', title:'',cat_rows:[], equip_data:rows, tech_info:rows1[0], request:1});
    //             });
    //         }
    //     });
    // });

    // app.get("/", afunc.find_fields, afunc.find_fields2);


    // app.get('/', function(req,res){
    //     connection.query("SELECT * FROM all_equipment WHERE id = 42",function(err,rows){
    //         if(err) throw err;
    //         else {
    //             connection.query("SELECT * FROM equipment_type WHERE type_id = ?",[rows[0].type_id], function(err1,rows1){
    //                 if(err1) throw err1;
    //                 else res.render("./user_liveauctions.ejs", {username:'', title:'',cat_rows:[], equip_data:rows, tech_info:rows1[0], request:1});
    //             });
    //         }
    //     });
    // });


	// app.get('/', function(req,res){
	// 		connection.query("SELECT start_date AS 'Date Searched' FROM auctions", function(err,rows,fields){
	// 		if(err) throw err;
	// 		else {
	// 			var y = "";
	// 			obj = {
 //                    name : "Views | Requests | Compares"
 //                };
 //                var my = [2,3,4,5,6,7,8];
 //                fields.push(obj);
	// 			var x = (String)(rows[1]["Date Searched"]);
	// 			x = x.slice(0,-18);//remove sec and GMT etc
	// 			rows[1]["Date Searched"] = x;
	// 			for(var i =0; i <rows.length; i++){
	// 				y = JSON.stringify(rows[i]);
	// 				y = y.slice(0,-1);
	// 				y = y + ',"'+obj.name+'":"'+my[i]+'"}';
	// 				rows[i] = JSON.parse(y);
	// 			}
	// 			res.render("index.ejs", {fields:fields, users:rows});	
	// 		}
	// 	});
	// });


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

app.get('/',function(req,res){
    res.render('./admin_add_to_auction.ejs',{username:"",category:0,datarows:[]});
 

//     app.get('/', function(req,res){
//     	res.render('./user_split_screen.ejs');
//     });

//     app.get('/buy_sell', gfunc.login);
//     app.get('/user_login', gfunc.login);
    
//     app.post('/user_login', function(req, res, next){
//             //call the local-login in ../config/passport.js
//         passport.authenticate('local-user-login', function (err, user, info) {
//             // info is json given by passport.aunthicate
//             //this function is called when LocalStrategy returns done function with parameters
//             if(err) 
//                 return res.render('./user_login.ejs', {msg : 'Please Try Again!', login_para : 1});    
//             //if username or password doesn't match
//             if(!user) return res.render('./user_login.ejs', {msg: 'Please Try Again!', login_para : 1});  
//             //this is when login is successful
//             req.logIn(user, function(err) {
//                 if (err) return res.render('./user_login.ejs', {msg : 'Please Try Again!', login_para : 1}); 
//                 else  return next();
//             });   
//         })(req,res,next);
//     }, ufunc.dashboard);
//         // function(req,res,next){
//         //     if(req.params.id != 0) return next();
//         //     else return gfunc.home(req,res);
//         // }, gfunc.view);

//     app.post('/user_signup', function(req, res, next){
//         passport.authenticate('local-signup', function (err, user, info) {
//             //this function is called when LocalStrategy returns done function with parameters
//             if(err) return res.render('./user_login.ejs', {msg : 'Please Try Again!', login_para:0});    
//             //if username or password doesn't match
//             if(!user) return res.render('./user_login.ejs', {msg:info.message,  login_para:0});
//             if (req.body.password != req.body.retype_password) return res.render('./user_login.ejs',{msg:'passwords did not match', login_para:0});
//             //if (!req.body.agree) return res.render('./user_signup.ejs',{msg:'You need to agree to TnC'});          
//             //this is when signup is successful
//             else return res.render('./user_login.ejs',{msg:'Signup successful! Login to continue', login_para:1});
//         })(req,res,next);
//     });
// //  // all are checking that the user is first logged in and then that he is of the right category that the request belong to.
//     app.get("/user_dashboard", gfunc.isLoggedInfunc, ufunc.dashboard);
// //     //links from dashboard
//     app.get('/user_search_category', gfunc.isLoggedInfunc,ufunc.search_category);
//     app.post('/user_search',gfunc.isLoggedInfunc,ufunc.search);
// //     //links from side_nav_bar
// //     //Equipments
//     app.get("/user_my_requests", gfunc.isLoggedInfunc, ufunc.my_requests0,ufunc.my_requests1, ufunc.my_requests2, ufunc.my_requests3, ufunc.my_requests4, ufunc.my_requests5);
//     app.get('/user_my_equipment', gfunc.isLoggedInfunc,ufunc.my_equipment1,gfunc.equip_data,ufunc.my_equipment2 );
//     app.get('/user_add_equipment',gfunc.isLoggedInfunc, ufunc.check_profile, ufunc.get_add_equipment);
//     app.get("/user_saved_searches", gfunc.isLoggedInfunc, ufunc.saved_searches);
// //     //Auction
//     app.get("/user_upcoming_auctions",gfunc.isLoggedInfunc,ufunc.upcoming_auctions);
//     app.get("/user_live_auction",gfunc.isLoggedInfunc,ufunc.live_auction);
//     app.get("/user_auction_results", gfunc.isLoggedInfunc, afunc.show_auctions);
// //     //app.get("/this_auction_result:id", gfunc.isLoggedInfunc,);
// //     //links from header dropdown - logout is a common function
//     app.get('/user_update_profile',gfunc.isLoggedInfunc, ufunc.get_update_profile);
//     app.post('/user_update_profile', gfunc.isLoggedInfunc, ufunc.post_update_profile);

//     app.get('/user_compare',gfunc.isLoggedInfunc,ufunc.compare);
// //     // app.get('/user_compare_now', gfunc.isLoggedInfunc,ufunc.compare_now);
//     app.get('/user_save_search', gfunc.isLoggedInfunc, ufunc.save_search);    
//     app.get('/user_request:id', gfunc.isLoggedInfunc, ufunc.request_this);
// //     // app.post("/user_proposal_status", gfunc.isLoggedInfunc,ufunc.change_proposal_status);    
   
//     app.get('/user_reset_password', gfunc.isLoggedInfunc, ufunc.get_reset_password);
//     app.post('/user_reset_password', gfunc.isLoggedInfunc, ufunc.post_reset_password, ufunc.get_reset_password);
//     app.get('/user_update_equipment:id',gfunc.isLoggedInfunc, ufunc.get_update_this_equipment);
//     app.post('/user_update_equipment:id', gfunc.isLoggedInfunc, ufunc.post_update_this_equipment,gfunc.view1,gfunc.view2);
// //     // //app.get('/user_view_equipment', gfunc.isLoggedInfunc, ufunc.view_equipment);
//     app.get('/user_add_equipment_category', gfunc.isLoggedInfunc, ufunc.get_add_equipment_category);
//     app.get('/user_add_equipment_subcategory', gfunc.isLoggedInfunc, ufunc.get_add_equipment_subcategory);
//     app.get('/user_add_equipment_brand', gfunc.isLoggedInfunc, ufunc.get_add_equipment_brand);
//     app.post('/user_add_equipment', gfunc.isLoggedInfunc, ufunc.post_add_equipment, ufunc.get_add_equipment);
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
//     app.get('/admin_my_equipment', gfunc.isLoggedInfunc,admin_access,afunc.my_equipment);        
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

    if(req.session.category==0){ console.log(req.session.category); return next();}
    else return res.render("./error.ejs");
};


// // var dealer_user_access = function access(req,res,next){
// //     if(req.session.category==0 || req.session.category ==2) return next();
// //     return res.render("Profiles/dealer/error.ejs");
// // } 
 


