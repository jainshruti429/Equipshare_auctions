// functions/API of a general user.

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


var isLoggedIn = function(req, res) {  
        var x ;
        if (req.isAuthenticated()) x=1;
        else x = 0;
        return x;
    };

var index_featured = [];
connection.query("SELECT all_equipment.photo1, all_equipment.expected_price, all_equipment.subcategory,all_equipment.category, all_equipment.brand, all_equipment.model, all_equipment.id FROM all_equipment INNER JOIN featured ON featured.equip_id = all_equipment.id WHERE featured.display = 1",function(errf,featured){
    if(errf) throw errf;
    else index_featured = featured;
});

var index_cat = [];
connection.query("SELECT DISTINCT category FROM equipment_type", function(errc,cat_rows){
    if(errc) throw errc;
    else index_cat = cat_rows;
});

var msg;

module.exports = {

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
                    //compare k log rakhna h na :P
                    //connection.query();
                    res.send(rows);} 
            });
        }
        else res.send();
    },

    compare :function(req,res){
        if(!req.session.compare) req.session.compare = []; 
        compare = req.session.compare
        if(compare.length>4) return res.send();
        type_id = req.query.type_id;
        for(var i = 0; i< compare.length; i++){
            if(compare[i] == type_id){
                compare.splice(i,1);
                return res.send(compare);
            }
        }
        compare.push(req.query.type_id);
        req.session.compare = compare;
        return res.send(compare);
    },

    home: function(req,res){
        res.render("index.ejs");
    },

    new_home: function(req,res){
                if(req.session) {
                    username = req.session.name;
                    if(req.session.msg) {
                        msg = req.session.msg;
                        req.session.msg = '';
                    }
                    else msg = '';    
                }
                else username = '';
        res.render("index_new.ejs", {featured : index_featured, cat_rows:index_cat, subcat_rows: [], selected : '',isLoggedIn: isLoggedIn(req,res), username : username, msg : msg });
    },

    beta_home: function(req, res) {
            var username;
            var msg;
                if(req.session) {
                    username = req.session.name;
                    if(req.session.msg) {
                        msg = req.session.msg;
                        req.session.msg = '';
                    }
                    else msg = '';    
                }
                else username = '';
                                
        if(index_cat.length){
            connection.query("SELECT DISTINCT subcategory FROM equipment_type WHERE category = ?",[index_cat[0].category], function(err2, rows2){
                if(err2) throw err2;
                else res.render("./user_index.ejs", {featured : index_featured, cat_rows:index_cat, subcat_rows: rows2, isLoggedIn: isLoggedIn(req,res), selected : '', username : username, msg : msg});
            });
        }
        else res.render("./user_index.ejs", {featured : index_featured, cat_rows:index_cat, subcat_rows: [], isLoggedIn: isLoggedIn(req,res), selected : '', username : username, msg : msg}); 
    },

    featured: function(req,res){
        connection.query("SELECT views FROM featured WHERE equip_id = ?",[req.params.id],function(err,rows){
            if(err) throw err;
            else {
                var views = rows[0].views + 1;
                connection.query("UPDATE featured SET views = ? WHERE equip_id = ?",[views, req.params.id],function(err1,rows1){
                    if(err1) throw err1;
                    else{
                        connection.query("SELECT * FROM all_equipment WHERE id = ?",[req.params.id], function(err2, rows2){
                            if(err2) throw err2;
                            else {
                                request = 1;
                                connection.query("SELECT * FROM equipment_type WHERE type_id = ?" ,[rows2[0].type_id], function(err4, rows4){
                                    if(err4) throw err4;
                                    else res.render('./user_view.ejs', {equip_data : rows2, featured:index_featured, tech_info : rows4[0], request:request, isLoggedIn : isLoggedIn(req,res), username: req.session.name});                            
                                });
                            }       
                        });       
                    }
                });
            }
        });
    },

    login : function(req,res){
        res.render('./user_login.ejs' , {msg : 'Enter the following details', login_para : 1, id:req.params.id,  isLoggedIn : isLoggedIn(req,res)});
    },

    search_category : function(req,res){
        var cat_selected = req.query.category;
        var sql="SELECT DISTINCT subcategory FROM equipment_type WHERE category = ?";
        connection.query(sql, [cat_selected], function(err,result){
            if(err){res.end('error');}
            else res.send(result);
        });  
    },

    search: function(req,res){
        url = req.url;
        url = url.slice(0,-7);
        req.session.subcategory = req.body.subcategory;
        if(url){
            query = "SELECT * FROM equipment_type WHERE subcategory = ?"
            page = "./new_list.ejs";
        }
        else{
            query = "SELECT * FROM all_equipment WHERE available = 1 AND subcategory = ?"
            page = './user_view_equipment.ejs' ;
        }
        connection.query(query ,[req.body.subcategory],function(err,rows){
            if(err) throw err;
            else res.render(page , {datarows: rows,  isLoggedIn : isLoggedIn(req,res), username: req.session.name});  
        });
    },

    email : function(req,res, next){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) dd = '0'+dd;
        if(mm<10) mm = '0'+mm; 
        today = dd + '/' + mm + '/' + yyyy;
        connection.query("INSERT INTO emails(email, date, resolved) VALUES(?,?,?)", [req.body.email, today, 0], function(err){
            if(err) throw err;
            else {
                req.session.msg = "Your inquiry is recorded"
                next();}
        });
    },

    // route to check that the client is loged in
    isLoggedInfunc: function(req, res, next) {
        // if user is authenticated in the session, carry on else ask them to login again
        if (req.isAuthenticated()) return next();
        else {
            var id ; 
            if(req.params.id) id = req.params.id;
            else id = 0;
            res.render('./user_login.ejs', {login_para : 1,msg:"PLease Login to continue", id:id , isLoggedIn : isLoggedIn(req,res) });
        }
    },

    // Ends current session
    logoutfunc: function(req, res, next) {
        req.logout();
        req.session.destroy(function(err) {
            if(err) throw err;
            else next();
        });
    },

    view: function(req,res){
        url = req.url;
        id = req.params.id;
        if(id[0] == 't') {
            id = id.slice(1);
            table = "equipment_type";
            page = "./new_details.ejs";  
            para = "type_id";          
        }
        else{
            table = "all_equipment";
            page = "./user_view./ejs";
            para = "id";
        }
        connection.query("SELECT * FROM "+ table +" WHERE "+para+" = "+id,function(err,rows){
            if (err) throw err;
            else{
                var request; //for the option of request...
                if(isLoggedIn(req,res)){
                    var viewer = req.session.user;
                    if (viewer == rows[0].owner_id) {request = 0;}//if one views details of his own equipment
                    else if(!req.session.category) {request = 1}
                    else{
                        request =1;
                        connection.query("SELECT * FROM views WHERE equip_id = ? AND viewer_id = ?",[req.params.id, viewer],function(err2, row2){
                            if(err2) throw err2;
                            if(!row2.length){ //if viewer is not already added in the list
                                connection.query("INSERT INTO views (equip_id, viewer_id) VALUES (?,?)", [req.params.id, viewer], function(err1){
                                    if(err1) throw err1;
                                });        
                            }
                        });
                    }
                }
                else {request = 1;}
                
                if(req.params.id[0] != 't'){
                connection.query("SELECT * FROM equipment_type WHERE type_id = ?" ,[rows[0].type_id], function(err4, rows4){
                    if(err4) throw err4;
                });
                }
                else rows4 = [];

                res.render(page, {equip_data : rows, featured:index_featured, tech_info : rows4[0], request:request , isLoggedIn : isLoggedIn(req,res), username: req.session.name});                            
            }    
        });
    },

 
}


/*

    //Fix wallet
    walletfunc: function(req, res) {
        var userid = req.session.user;
        var category = req.session.category;
        connection.query("SELECT * FROM account WHERE id = ?",[userid], function(err, rows){
            wallet_data = {
                wallet_balance : rows[0].wallet, // send balance info.
                user: userid,
                category : category
            };
            switch (category) {
                case 1:
                    res.send(wallet_data);
                    break;
                case 2:
                    res.send(wallet_data);
                    break;
                case 3:
                    res.send(wallet_data);
            }
	    });
    },

    dashboard: function(req, res){
        var userid = req.session.user;
        var category = req.session.category;
        selectquery = "SELECT * FROM all_equipment where (dealer != ? AND ( ( (? = '1') AND (auction_para = '2' ) ) OR ( (? = '2') AND  ( (auction_para = '1') OR (auction_para = '3') ) ) ) ) ORDER BY (likes - (YEAR(CURDATE()) - year) + (bought_price/100000) ) DESC";
        connection.query(selectquery, [userid, category, category], function(err, rows){
            if(category == 1 || category == 2){
                res.send({
                    id : req.session.user,
                    car_data : rows // get the user out of session and pass to template
                });
            }
            else if(category == 3){
                res.send({
                    id : req.session.user,
                    car_data : rows // get the user out of session and pass to template
                });
            }
        });
    },


    forgot: function(req, res){
        var userid = req.body.mobile;
        selectquery = "SELECT * from account where mobile = ?";
        connection.query(selectquery, [userid], function(err, rows){

            if(err)throw err;
            else if(!rows.length){
                res.send({msg: "no user with this mobile exists"});
            }
            else {
                others.generate_mail(req, rows);
                res.send({msg: "A mail has been send to your registered email-id"})
            }
        })
    },


    existing_dealers: function(req,res){
        var category = req.session.category;
        connection.query("SELECT * FROM account WHERE category = 2", function(err, rows){
            if (err){
                throw err;
            }
            else if (!rows.length) {
                req.send("Please add a location to view");
            }
            else {
                if(category== 3 || category == 2){
                    res.send(rows); 
                }
                else res.send({msg: "Not found"});
            }
        });
    },



    dealer_my_equipment: function(req,res){
        selectQuery = "select * from all_equipment where dealer = ?";
        connection.query(selectQuery,[req.session.user], function(err, rows){
            if (err){
                throw err;
            }
            else {
                res.send(rows);
            }
        });
    },

    change_auction_status: function(req, res){
        var data = req.body;   // get category and mini bid from form
        if(data.mini_bid == ''){
            data.mini_bid = 0;
        }

        var next_auction_id = module.exports.next_upcoming_auction(data.type);

        if (!next_auction_id){
            res.send("No Upcoming Auction");
        }
        else{
            updatequery = "UPDATE all_equipment SET auction_para = ?, auction = ?, mini_bid = ?, next_bid = ? where id = ?";
            connection.query(updatequery, [data.type, next_auction_id, data.mini_bid, data.mini_bid, data.id], function(err, rows){
                if (err){
                    throw err;
                }
                else {
                    connection.query("UPDATE auction_object SET auction = ?")
                    res.send("Auction status changes");
                }
            });
        }
    },

    my_bids : function(req, res){
        selectquery = "SELECT * FROM bids WHERE buyer_id = ?"
        connection.query(selectquery, [req.session.id], function(rows, err){
            req.send(rows);
        });
    },

    //================================================================================
    //======================= General FUNCTIONS ======================================
    //================================================================================

    add_new_bid: function(req, res){
        data = req.body;
        var id = req.session.user;
        var category = req.session.category;
        var next_bid=0;
        selectquery = "SELECT * from all_equipment INNER JOIN auction ON all_equipment.auction = auction.id WHERE all_equipment.id = ?"
        connection.query(selectquery,[data.equip_id], function(err,rows){
            if(err){
                throw err;
            }
            else if(!rows.length){
                res.send("Not Available for auction");
                return;
            }
            else if( (rows[0].auction_para == 0) || (rows[0].auction_para == 4) || ((rows[0].auction_para == 1 || rows[0].auction_para == 3)  && category !== 2) || (rows[0].auction_para == 2 && category !== 1)){

                res.send("You are not eligible for this auction");
                return;
            }
            else{
                next_bid=rows[0].next_bid;
            }

        
            if(data.new_bid <= next_bid){
                //message to flash that you must bid higher than mini bid
                res.send({msg: "Please Bid higher"});
            }
            else {
                next_bid = Number(data.new_bid) + 1000;
                data.equip_id = Number(data.equip_id);        
                insertQuery = "INSERT INTO bids (equip_id, auction_id, buyer_id, bid_price) values (?,?,?,?)";
                connection.query(insertQuery, [data.equip_id, rows[0].auction, id, data.new_bid], function(err, req, fields){
                    if(err) throw err;
                    else{
                        updatequery = "UPDATE all_equipment SET next_bid = ? where id = ?";
                        connection.query(updatequery, [next_bid, data.equip_id], function(err,req){
                            if(err) throw err;
                            else{
                            res.send({msg: "Your bid is recorded"});
                            }
                        });
                    }
                });
            }
        });
    },

        add_to_likes: (req,res)=>{
        insertQuery="INSERT IGNORE INTO likes (user_id, equip_id) VALUES (?,?)";
        connection.query(insertQuery,[req.session.user, req.body.equip_id],(err,rows)=>{
            if(err){
                throw err;
            }
            else{
                if(rows.affectedRows){
                Query="UPDATE all_equipment SET likes=likes+1 WHERE id= ?"
        connection.query(Query,[req.body.equip_id],(err,rows)=>{
            if(err){
                throw err;
            }
            else{
                res.end();
            }
        });
            }
            res.end();
        }
        });
        
    },


    my_likes: (req,res)=>{
        selectQuery="SELECT * FROM all_equipment a, (select * from likes WHERE user_id = ?) b where a.id = b.equip_id";
        connection.query(selectQuery,[req.session.user],(err,rows)=>{
             if(err){
                throw err;
                   }
             else{
                 res.send(rows);
                   } 
        });
    },


    search_suggestions : function(req,res){
        ab =req.body.key+"%";
        connection.query("SELECT * from std_equipment where model like ?",[ab],function(err, rows,) {
            if (err) 
                throw err;
            else{
                var data=[];
                for(i=0;i<rows.length;i++)
                {       
                   data.push(rows[i].model);
                }
                res.end(JSON.stringify(data));
            }
        });
    },


    search : (req,res)=>{
        selectquery="SELECT * FROM all_equipment WHERE name = ? ORDER BY likes DESC";
        connection.query(selectquery,[req.body.name],(err,rows)=>{
            if(err)
                throw err;
            else{
                res.send(rows);
            }
        });
    },


//=================================================================================================
    
    next_auction : (req,res)=>{
        selectquery = "SELECT * from auction WHERE end_time > NOW() ORDER BY start_time ASC";
        connection.query(selectquery, (err,rows)=>{
            if(err) throw err;
            else if(!rows.length){
                res.send("NO AUCTION AVAILABLE");
            }
        else {
            res.send(rows);
        // callback(rows);
            }
        });
    },


    next_upcoming_auction: function(type){
        selectquery = "SELECT id from auction WHERE ( start_time > NOW() AND type = ?) ORDER BY start_time ASC";
        connection.query(selectquery,[type], function(err,rows){
            if(err) throw err;
            else if(!rows.length){
                return undefined;
            }
            else {
                var auctionid = rows[0].id;
                return auctionid;
            }
        });
    },


    pending_request: function(req, res){
        selectquery = "SELECT * from all_equipment where auction_para = '4' and dealer = ?";
        connection.query(selectquery, [req.session.user],function(err,rows){
            if (err) throw err;
            else res.send(rows);
        });

    }
}
*/