var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection); 
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })  
const formData = require('express-form-data');
const os = require("os");
const { query } = require('express');
const multer = require('multer');
const normalize = require('normalize-path');



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'tmp/my-uploads');
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + ".jpg");
    }
  });



const upload = multer({
    storage: storage,
});








module.exports = function(app,passport) {
    
    app.get('/',function(req,res){
            res.render('index', { user: req.user, isLoggedIn: req.isAuthenticated()}); // we send it to user.ejs.

    });


    app.get('/login', function(req, res) {
        res.render('login.ejs',{
        message: req.flash('loginMessage'),
        user: req.user, isLoggedIn: req.isAuthenticated(),
      
        
    });
 
    });

    app.get('/signup', function(req, res){
        res.render('signup.ejs',{
        message: req.flash('message'),
        user: req.user, isLoggedIn: req.isAuthenticated()
    });
    });

    app.post('/signup', passport.authenticate('local-signup', {
            session: false ,
            successRedirect: '/login',
            failureRedirect: '/signup',
            failureFlash : true 
    }));

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', 
            failureRedirect : '/login',
            failureFlash : true 
        }),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/home', function(req,res) {
        res.render('index.ejs', {user: req.user, isLoggedIn: req.isAuthenticated()});
    });
    app.get('/profile',isLoggedIn, userReservation, function(req,res){
        var reserv = reservation;
        res.render('profile.ejs',{
        user: req.user,
        isLoggedIn: req.isAuthenticated(),
        reserv: reserv
        });
        console.log(reservation);
    });
   

    // search by city
    app.get('/search',isLoggedIn, search, (req, res) => {
        var searchResult = req.searchResult;
        var term = req.searchTerm;
        res.render('search', {
            result: searchResult.length,
            searchTerm: req.searchResult,
            searchResult: searchResult,
            user: req.user, isLoggedIn: req.isAuthenticated(),
            term
        })

    });
    app.post('/search/booking',isLoggedIn, selectedRyad , urlencodedParser, (req, res) =>{
        var selectedRiad = req.selectedRiad;
        console.log(selectedRiad);
        res.render('booking',{
            selectedRiad: selectedRiad,
            user: req.user ,isLoggedIn: req.isAuthenticated(),
        } );
    });
    app.post('/profile',isLoggedIn,reservation, urlencodedParser, userReservation,  (req, res) => {
        var reserv = reservation;
        var bookingInfo = req.body;
        var userName = req.user;
        res.render('profile',{
            user: req.user ,isLoggedIn: req.isAuthenticated(),
            bookingInfo: bookingInfo,
            reserv: reserv
        });
    })
    app.get('/reservations',isLoggedIn,allreservations, (req, res)=>{
        res.render('reservations',{
            user: req.user ,isLoggedIn: req.isAuthenticated(),
            allreserve
        });
    })
    app.post('/reservations/delete', deleteReservation, (req, res) =>{
       console.log("called")
    });
    app.post('/Admin',upload.single('img'),addRyad, (req, res) =>{
        res.render('admin', {
            user: req.user ,isLoggedIn: req.isAuthenticated(),
        });
        
    });
    app.get('/Admin', isLoggedIn, allRyads, (req, res) =>{
        var all = allRyads;
        res.render('admin', {
            user: req.user ,isLoggedIn: req.isAuthenticated(),
            all: all
        })
        
    })
    app.get('/Admin/all',allRyads, (req, res) =>{
        var all = allRyads;
        res.send(all)
    })
    app.delete('/Admin/:id',deleteRyad, (req, res) => {
        const { id } = req.params;
        console.log(id);
        
      });
    app.post('/Admin/update', updateRyad,(req, res) =>{
        var values =  req.body;
        console.log(values);
    });
    app.get('*', function(req, res) {
        res.redirect('/');
    });
};


function search(req, res, next) {
    var searchTerm = req.query.search;

    let query = '';
    if (searchTerm != ''){
        query = 'SELECT * FROM ryads WHERE city LIKE "%' + searchTerm + '%"';
    }
    connection.query(query, (err, result) => {
        if (err){
            req.searchResult = "";
            req.searchTerm = "";
            next();
        }
        req.searchResult = result;
        req.searchTerm = searchTerm;
        next();
        console.log(result);

    });
}

function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next();
	res.redirect('/login');
}

function selectedRyad(req, res, next){
    var selectedId = req.body.Rid;
    var alldataquery = 'SELECT * FROM ryads WHERE ryadid = ' + selectedId ;
    connection.query(alldataquery, (err, result) => {
        if (err){
            req.selectedRiad = "";
            next();
        }
        req.selectedRiad = result;
        next();
        console.log(alldataquery);
        next();
    });
}

function reservation(req,res, next) {
    var reservedRyad = req.body;
  
    var query = "INSERT INTO reservation (ryadid, id, Susername, Semail, Sryadname, Sryadcity, Srooms, Sryadaddress, Sprice, img) values (?,?,?,?,?,?,?,?,?,?)";
    var selectquery = "SELECT rooms FROM ryads where ryadid =" + reservedRyad.Sryadid;
    connection.query(query,[reservedRyad.Sryadid, reservedRyad.Suserid, reservedRyad.Susername, reservedRyad.Semail, reservedRyad.Sryadname, reservedRyad.Sryadcity, reservedRyad.Srooms , reservedRyad.Sryadaddress, reservedRyad.Sprice, reservedRyad.img ], (err, result) => {
        if (err){
            console.log(err)
        }
        next();
    });
    var rooms = "";
    
    connection.query(selectquery, (err, result)=>{
        if(err){
            console.log(err);
        }
        rooms = result;
        var updatedrooms = rooms[0].rooms - reservedRyad.Srooms;
        var updatequery = "UPDATE ryads SET rooms = "+ updatedrooms +" WHERE ryadid ="+reservedRyad.Sryadid;
        connection.query(updatequery, (err, result)=>{
        if(err){
        console.log(err);
        }
        var deletebyrooms = "DELETE FROM ryads where rooms < 1";
        connection.query(deletebyrooms, (err,result)=>{
            if(err){
                console.log(err);
            }
             return result;
        })
      
    })
    });    
}
function allreservations(req, res, next){
    var query = "SELECT * FROM reservation";
    connection.query(query, (err,result)=>{
        if(err){
            console.log(err);
            next();
        }
        allreserve = result;
        next();
    })
}


function addRyad(req, res, next) {
    var ryadData = req.body;
 
    var ryadImg = normalize(req.file.path);
    var query = "INSERT INTO ryads (name, city, price, rooms, address, img) values (?,?,?,?,?,?)"
    if (ryadData != null || ryadImg != null) {
        connection.query(query, [ryadData.name, ryadData.city, ryadData.price, ryadData.rooms, ryadData.address, ryadImg], (err, result)=>{
            if (err){
                console.log(err)
                next();
            }
            next();
        })
    }
}

function allRyads(req, res, next) {
    var query = "SELECT * FROM ryads"
    
    connection.query(query, (err, result) => {
        if(err){
           allRyads = "",
            console.log(err)
            next();
        }
        allRyads = result;
  
       next();
    })
}
function deleteRyad(req,res,next) {
    const { id } = req.params;
    var query = "DELETE FROM ryads WHERE ryadid = " + id;
    connection.query(query, (err, result)=>{
        if(err){
            console.log(err);
        }
        next();
    })
}
function deleteReservation (req, res, next){
    var id = req.body.id;
    var query = "DELETE FROM reservation WHERE reservationid =" + id;
    connection.query(query, (err, result)=>{
        if(err){
            console.log(err);
        }
        next();
    })
}
function userReservation (req, res, next){
    var user = req.user;
    var query = "SELECT * FROM reservation WHERE Susername = '" + user.name +"'";
    connection.query(query, (err, result)=>{
        if(err){
            console.log(err);
        }
        reservation = result;
        console.log(reservation)
        next();
    })
}
function updateRyad (req, res, next) {
    var Edited = req.body;
    var query = "UPDATE ryads SET name = '"+ Edited.name+"', city = '" + Edited.city +"', price ='" + Edited.price +"', rooms ='" + Edited.rooms +"', address = '" + Edited.address + "' WHERE ryadid = "+ Edited.id;
    connection.query(query, (err, result)=>{
        if (err){
            console.log(err);
        }
        next();
    })
}

