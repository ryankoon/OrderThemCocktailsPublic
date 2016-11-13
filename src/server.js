/**
 * Created by Alek Hrycaiko on 2016-10-16.
 */
'use strict';
// Connect to db
var mysql = require('mysql'),

pool  = mysql.createPool({
    connectionLimit : 4,
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

/*
In order to setup api routes, use router.route
In order to serve html to the client, use app.route and provide res.send with the html file. should also work for templating.
 */

// middleware incase we need to do transformations of some sort.
router.use(function (req, res, next){
    next();
});
/*
returns a promise from making an endpoint request.
 */
function endpoint(query) {
    return new Promise(function (fulfill, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("Error: " + err.message);
                reject(err.message);
            } else {
                console.log('connected, doing a query');
                connection.query(query, function (err, rows, col) {
                    if (err) {
                        console.log(err.message);
                        reject(err.message);
                    }
                    fulfill(rows);
                    connection.release();
                });
            }
        });
    });
}

/*
TODO: Implement an api endpoint.
 */

router.route('/employee')
    .get(function (req, res) {
        res.send(200);
    });

router.route('/customer')
    .get(function (req, res) {
        res.json({notes: "Buy drinks please!"});
    });

router.route('/ingredients/base')
    .get(function (req, res) {
        endpoint("select ingredient.name, price, description from ingredient join alcoholicingredient ai on ai.name = ingredient.name")
            .then(function (result) {
            res.json(result);
        }).catch(function (err) {
            console.error("Something went wrong sorry");
        });
    });

/*
    ex. ingredients/base/Vodka
 */

router.route('/ingredients/base/:type')
    .get(function (req, res) {
        // console.log("type" + JSON.stringify({type:req.params.type}));
        endpoint("select * from alcoholicbase where type = " + "'" + req.params.type + "'").then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong sorry");
        });
    });

router.route('/ingredients/garnish')
    .get(function (req, res) {
        endpoint("select ingredient.name, price, description from ingredient join garnish g on g.name = ingredient.name")
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong sorry");
        });
    });

router.route('/ingredients/nonalcoholic')
    .get(function (req, res) {
        endpoint("select ingredient.name, price, description from ingredient join nonalcoholic n on n.name = ingredient.name").
        then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong sorry");
        });
    });

app.use('/', router);
app.listen(port);
console.log("Oh my..  we have a connection now at port:" + port + " don't we?");