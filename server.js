
var dbconfig = require('./config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection);
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const serveIndex = require('serve-index');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 3000;
var passport = require('passport');
var flash    = require('connect-flash');

  
require('./config/passport.js')(passport); 


app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// app.use(express.static(__dirname + '/views/JS'));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname, + 'tmp'));
app.use('tmp', express.static(process.cwd() + 'tmp'));
// app.use(express.static(__dirname, 'public'));
// app.use('/ftp', express.static('tmp'), serveIndex('tmp', {'icons': true}));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'isrunning',
    resave: true,
    saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//passin to all the views
app.use(function(req, res, next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('server is running  localhost: ' + port);
