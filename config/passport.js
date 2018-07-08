// config/passport.js
// functions for signup and login


// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

//connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup 
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM account WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // SIGNUP 
    // =========================================================================

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with mobile
            usernameField : 'mobile',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        // functions called on signup.
        function(req, mobile, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT id FROM account WHERE mobile = ?",[mobile], function(err, rows) {
                if (err) return done(err);
                if (rows.length) return done(null, false, {usrmsg: 'This mobile no. is already registered'});
                else {
                    // if there is no user with that mobile no. create the user
                    var newUserMysql = {
                        name: req.body.name,
                        password: bcrypt.hashSync(password, null, null),  // use the generateHash function in our user model
                        category: 1,
                        mobile: req.body.mobile
                    };
                    // insert the data into the db-table account
                    var insertQuery = "INSERT INTO account (name, password, mobile, category) values (?,?,?,?)";
                    // make a query
                    connection.query(insertQuery,[newUserMysql.name, newUserMysql.password,  newUserMysql.mobile, newUserMysql.category],function(err) {
                        if(err)return done(err);
                        else{    
                        return done(null, newUserMysql, "Successfull");
                        }
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN
    // =========================================================================

    passport.use(
        'local-admin_login',
        new LocalStrategy({
             // by default, local strategy uses username and password, we will override with mobile
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        // function for login
        function(req, username, password, done) { // callback with email and password from our form
            // select if account exists.
            connection.query("SELECT id,name,category,password FROM account WHERE name = ?",[username], function(err, rows){
                if (err){ // if error occurs
                    return done(err);
                }
                if (!rows.length) { // if there is no rows selected, i.e. no user is there, then
                    return done(null, false, "No user found"); 
                }
                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password)){
                    return done(null, false, "Oops! Wrong password"); }//send error message to client
                if(rows[0].category != 0) return done(null, false, "Wrong Category");
                //otherwise, add data to session.
                else{
                    req.session.msg = "Admin: "+rows[0].name+" ID: "+rows[0].id+" logged in";
                    req.session.user = rows[0].id;
                    req.session.category = rows[0].category;
                    req.session.name = rows[0].name;

                    // if all is well, then return "Welcome" after saving data to session
                    console.log("Admin: "+rows[0].name+" ID: "+rows[0].id+" logged in");       
                    return done(null, rows[0], "Admin: "+rows[0].name+" ID: "+rows[0].id+" logged in");
                }
            });
        })
    );

    passport.use(
        'local-user-login',
        new LocalStrategy({
             // by default, local strategy uses username and password, we will override with mobile
            usernameField : 'mobile',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        // function for login
        function(req, mobile, password, done) { // callback with email and password from our form
            // select if account exists.
            connection.query("SELECT id,name,category,password FROM account WHERE mobile = ?",[mobile], function(err, rows){
                if (err){ // if error occurs
                    return done(err);
                }
                if (!rows.length) { // if there is no rows selected, i.e. no user is there, then
                    return done(null, false, "No user found"); 
                }
                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password)){
                    return done(null, false, "Oops! Wrong password"); }//send error message to client
                //otherwise, add data to session.
                else{
                req.session.user = rows[0].id;
                req.session.category = rows[0].category;
                req.session.name = rows[0].name;
                req.session.msg = "Welcome" + rows[0].name;

                // if all is well, then return "Welcome" after saving data to session
                console.log("User: "+rows[0].name+" ID: "+rows[0].id+" logged in");       
                return done(null, rows[0], "User: "+rows[0].name+" ID: "+rows[0].id+" logged in");
                }
            });
        })
    );

    passport.use(
        'local-company-login',
        new LocalStrategy({
             // by default, local strategy uses username and password, we will override with mobile
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        // function for login
        function(req, username, password, done) { // callback with email and password from our form
            // select if account exists.
            connection.query("SELECT id,name,category,password, address1 FROM account WHERE name = ?",[username], function(err, rows){
                if (err){ // if error occurs
                    return done(err);
                }
                if (!rows.length) { // if there is no rows selected, i.e. no user is there, then
                    return done(null, false, "No user found"); 
                }
                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password)){
                    return done(null, false, "Oops! Wrong password"); }//send error message to client
                //otherwise, add data to session.
                if(rows[0].category != 4) return done(null, false, "Wrong Category");
                else{
                    req.session.msg = "Comapany User: "+rows[0].name+" ID: "+rows[0].id+" logged in";
                    req.session.user = rows[0].id;
                    req.session.category = rows[0].category;
                    req.session.name = rows[0].name;
                    req.session.comapany = rows[0].address1;

                    // if all is well, then return "Welcome" after saving data to session
                    console.log("Comapany User: "+rows[0].name+" ID: "+rows[0].id+" logged in");       
                    return done(null, rows[0], "Comapany User: "+rows[0].name+" ID: "+rows[0].id+" logged in");
                }
            });
        })
    );

    passport.use(
        'local-bank-login',
        new LocalStrategy({
             // by default, local strategy uses username and password, we will override with mobile
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        // function for login
        function(req, username, password, done) { // callback with email and password from our form
            // select if account exists.
            connection.query("SELECT id,name,category,password, address1 FROM account WHERE name = ?",[username], function(err, rows){
                if (err){ // if error occurs
                    return done(err);
                }
                if (!rows.length) { // if there is no rows selected, i.e. no user is there, then
                    return done(null, false, "No user found"); 
                }
                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password)){
                    return done(null, false, "Oops! Wrong password"); }//send error message to client
                //otherwise, add data to session.
                if(rows[0].category != 5) return done(null, false, "Wrong Category");
                else{
                    req.session.msg = "Bank User: "+rows[0].name+" ID: "+rows[0].id+" logged in";
                    req.session.user = rows[0].id;
                    req.session.category = rows[0].category;
                    req.session.name = rows[0].name;
                    req.session.bank = rows[0].address1;

                    // if all is well, then return "Welcome" after saving data to session
                    console.log("Bank User: "+rows[0].name+" ID: "+rows[0].id+" logged in");       
                    return done(null, rows[0], "Bank User:  "+rows[0].name+" ID: "+rows[0].id+" logged in");
                }
            });
        })
    );

};
