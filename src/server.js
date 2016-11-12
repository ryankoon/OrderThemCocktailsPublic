/**
 * Created by Alek Hrycaiko on 2016-10-16.
 */
'use strict';
// Connect to db
var mysql = require('mysql');
var credentials = require('./../credentials.json');
var express = require('express');
var bodyParser = require('body-parser'); // used to read results from API calls.
var path = require('path');
var app = express();
// setup bodyParser to get data from POST - maybe unnecessary remove if something else is preferred.
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var router = express.Router();

var port = process.env.PORT || 8080;

var connection = mysql.createConnection({
    host : credentials.host,
    user: credentials.username,
    password: credentials.password,
    database: "acsm_6248af533021855"
})

connection.connect(function (err){
    console.log('Attempting to connect to MySQL');
    if (err){
       console.log('Errored out connecting : ' + err);
   }
});

// TODO: Generate a query so this doesnt fail.
connection.query('describe drink'), function (err, rows, columns) {
    if (err) {
        console.log(err);
    }
    console.log('BOOM! We did a query' + rows)
    console.log(columns);
}

/*
In order to setup api routes, use router.route
In order to serve html to the client, use app.route and provide res.send with the html file. should also work for templating.
 */

// middleware incase we need to do transformations of some sort.
router.use(function (req, res, next){
    next();
});

/*
TODO: Implement an api endpoint.
 */

router.route('/employee')
    .get(function (req, res) {
        res.send(200);
    });


app.use('/', router);
app.listen(port);
console.log("Oh my..  we have a connection now at port:" + port + " don't we?");