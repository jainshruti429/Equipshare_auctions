//initializing and loading things
var express  = require('express');
var app = express();
var port = process.env.PORT || 8080;
var serv = require('http').Server(app);
var io = require('socket.io').listen(serv); // for p2p chat.
var passport = require('passport');
var flash    = require('connect-flash');

var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan'); // to log everything
var fileUpload = require('express-fileupload');
var path = require('path');
var configDB = require('./config/database.js'); // including database config
//var html = require('html');
//==============================================================

require('./config/passport.js')(passport); // passport for configuration
//schedule_auction = require('./app/functions_admin'); // including admin functions

// set up of express application
app.use(express.static(path.join(__dirname,'/docs')));
app.use(express.static(path.join(__dirname, "/images")));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/")));

app.use(fileUpload());

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

// session configs

app.use(session({ 

	secret: "winteriscoming", // session key
	resave: true,
    saveUninitialized: true,
		cookie: {
			httpOnly: true,
			secure: false
	}
	})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================

serv.listen(port, function () { 
	console.log('server/server initiated'); 
});
// port
console.log('server/Server running on port: ' + port);
// 
app.use(function(err, req, res, next) { 
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('./error.ejs');
  console.log("server/error...............");
  console.log(err);
})

// useful link to understand how the login system works
//https://scotch.io/tutorials/easy-node-authentication-setup-and-local
