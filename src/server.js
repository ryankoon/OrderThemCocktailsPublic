/**
 * Created by Alek Hrycaiko on 2016-10-16.
 */
'use strict';
// Connect to db
var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 1,
    host     : 'ca-cdbr-azure-central-a.cloudapp.net',
    user     : 'bac51b949a66b0',
    password : '05b4c318',
    database : 'orderthemdrinksdb'
});
var Promise = require('bluebird');

var express = require('express');
var bodyParser = require('body-parser'); // used to read results from API calls.
var path = require('path');
var app = express();
// setup bodyParser to get data from POST - maybe unnecessary remove if something else is preferred.
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var router = express.Router();
var port = process.env.PORT || 8080;
var apiRouter = require('./api_routes');
apiRouter.apiRouting(router, pool);

/*
In order to setup api routes, use router.route
In order to serve html to the client, use app.route and provide res.send with the html file. should also work for templating.
 */



// TODO: insert ingredient, customer receipt, add a new order, add order to bartender, custom drink
// TODO: Profit and loss statement, top 5 drinks, Whisky that has been served by all servers (admin report)
app.use('/api', router);
app.listen(port);
console.log("Oh my..  we have a connection now at port:" + port + " don't we?");
