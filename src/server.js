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

router.route('/employee')
    .get(function (req, res) {
        res.send("login");
    });

router.route('/customer')
    .get(function (req, res) {
        res.send("login");
    });

router.route('/ingredients/base')
    .get(function (req, res) {
        var showAllAlcoholic = "select * from alcoholictype";
        endpoint(showAllAlcoholic)
            .then(function (result) {
            res.json(result);
        }).catch(function (err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
    ex. ingredients/base/Vodka
 */

router.route('/ingredients/base/:type')
    .get(function (req, res) {
        // console.log("type" + JSON.stringify({type:req.params.type}));
        var showBase = "select * from alcoholicingredient where type = " + "'" + req.params.type + "'";
        endpoint(showBase)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/ingredients/garnish')
    .get(function (req, res) {
        var showGarnish = "select ingredient.name, price, description from ingredient " +
            "join garnish g on g.name = ingredient.name";
        endpoint(showGarnish)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/ingredients/nonalcoholic')
    .get(function (req, res) {
        var showNonAlcoholic = "select ingredient.name, price, description from ingredient " +
            "join nonalcoholic n on n.name = ingredient.name";
        endpoint(showNonAlcoholic)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/employee/admin/staff')
    .get(function (req, res) {
        var showBartender = "select name from bartender";
        endpoint(showBartender)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 order history with drink name, bartender name, customer name, payment for order
 */

router.route('/employee/admin/orderhistory')
    .get(function (req, res) {
        var showOrderHistory = "select drink.name, bartender.name, co.cust_name, payment.amount as paid " +
            "from drinksinorder dio join customerorder co on dio.order_no = co.order_no " +
            "join drink on drink.id = dio.drink_id join bartender on co.bartender = bartender.eid " +
            "join payment on payment.order_no = co.order_no where co.is_open = 0";
        endpoint(showOrderHistory)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 works but is not a post query. Also, since eid is auto-incrementing and is primary key,
 can add same bartender name repeatedly. (???)
 */

router.route('/employee/admin/addstaff/:bartender')
    .get(function (req, res) {
        // console.log("insert into bartender (name) values (" + req.params.bartender + ")");
        var addBartender = "insert into bartender (name) values ('" + req.params.bartender + "')";
        endpoint(addBartender)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 works but is not a post query. 
 */

router.route('/employee/admin/removestaff/:bartender')
    .get(function (req, res) {
        // console.log("insert into bartender (name) values (" + req.params.bartender + ")");
        var addBartender = "DELETE FROM bartender where bartender.name = ('" + req.params.bartender + "')";
        endpoint(addBartender)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 returns preset drinks with prices
 */

router.route('/customer/drinks')
    .get(function (req, res) {
        var drinks_with_prices = "select  d.id, d.name, sum(ig.price) as price from ingredientindrink id " +
            "join drink d on id.d_id = d.id " +
            "join ingredient ig on id.i_name = ig.name group by d.name";
        endpoint(drinks_with_prices)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
    returns ingredients in a preset drink in the menu
 */

router.route('/customer/drinks/:drink')
    .get(function (req, res) {
        // console.log("insert into bartender (name) values (" + req.params.bartender + ")");
        var showIngredients = "select i_name from ingredientindrink " +
            "where d_id = (select id from drink where name = '" + req.params.drink + "')";
        endpoint(showIngredients)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/employee/bartender')
    .get(function (req, res) {
        var showOpenDrinks = "select co.cust_name, co.table_no, drink.name, co.notes " +
            "from drinksinorder dio join customerorder co on dio.order_no = co.order_no " +
            "join drink on drink.id = dio.drink_id " +
            "where co.is_open = 1";
        endpoint(showOpenDrinks)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

// TODO: insert ingredient, customer receipt, add a new order, add order to bartender
// TODO: Profit and loss statement, top 5 drinks, Whisky that has been served by all servers (admin report)
app.use('/', router);
app.listen(port);
console.log("Oh my..  we have a connection now at port:" + port + " don't we?");