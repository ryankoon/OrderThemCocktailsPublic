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
var moment = require('moment');
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
        var showBase;
        if (req.params.type.toLowerCase() === 'all') {
            showBase = "select a.name, a.abv, a.origin, a.type, i.available from alcoholicingredient a join ingredient i on i.name = a.name where i.available = 1";
        } else {
            showBase = "select a.name, a.abv, a.origin, a.type, i.available from alcoholicingredient a " +
                "join ingredient i on i.name = a.name " +
                " where a.type = " + "'" + req.params.type + "' and i.available = 1";
        }

        endpoint(showBase)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/ingredients/garnish')
    .get(function (req, res) {
        var showGarnish = "select ingredient.name, price, available, description from ingredient " +
            "join garnish g on g.name = ingredient.name where ingredient.available = 1";
        endpoint(showGarnish)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/ingredients/nonalcoholic')
    .get(function (req, res) {
        var showNonAlcoholic = "select ingredient.name, price, available, description from ingredient " +
            "join nonalcoholic n on n.name = ingredient.name where ingredient.available = 1";
        endpoint(showNonAlcoholic)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/employee/admin/staff')
    .get(function (req, res) {
        var showBartender = "select eid as 'id', name from bartender";
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
        var showOrderHistory = "select drink.name as drink, bartender.name as bartender, " +
            "co.cust_name as customer, payment.amount as paid " +
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

router.route('/employee/admin/removestaff/:eid')
    .get(function (req, res) {
        // console.log("insert into bartender (name) values (" + req.params.bartender + ")");
        var addBartender = "DELETE FROM bartender where bartender.eid = " + req.params.eid;
        endpoint(addBartender)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 returns list of ingredients that are not available
 */

router.route('/employee/admin/availability')
    .get(function (req, res) {
        var checkAvailable = "select * from ingredient where available = 0";
        endpoint(checkAvailable )
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 sets the available value of all ingredients to 1
 */
router.route('/employee/admin/restockall')
    .get(function (req, res) {
        var checkAvailable = "update ingredient set available = 1";
        endpoint(checkAvailable )
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });



/*
    returns top 5 most frequently ordered drinks - needs testing with more data
 */

router.route('/employee/admin/topdrinks')
    .get(function (req, res) {
        var top5 = "SELECT drink, quantity FROM (select drink.name as drink, count(drink.name) as quantity " +
            "from drinksinorder dio join customerorder co on dio.order_no = co.order_no " +
            "join drink on drink.id = dio.drink_id join bartender on co.bartender = bartender.eid " +
            "join payment on payment.order_no = co.order_no where co.is_open = 0 group by drink.name) AS k " +
            "GROUP BY drink ORDER BY quantity DESC LIMIT 5";
        endpoint(top5)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
returns the drinks sold with their total revenue over the specified time period
 */

router.route('/employee/admin/revenue/:from/:to')
    .get(function (req, res) {
        var from = req.params.from;
        var to = req.params.to;
        var revenue = "select drink.name as drink, sum(payment.amount) as revenue from drinksinorder dio " +
            "join customerorder co on dio.order_no = co.order_no join drink on drink.id = dio.drink_id " +
            "join payment on payment.order_no = co.order_no " +
            "where co.is_open = 0 and co.date_time > '" + from + "' and co.date_time < '" + to + "' " +
            "group by drink.name order by revenue desc";
        endpoint(revenue)
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


/*
    changes order from open to closed and adds bartender to order
 */

router.route('/employee/bartender/selectOrder/:eid/:order_no')
    .get(function (req, res) {
        var eid = req.params.eid;
        var order_no = req.params.order_no;
        var selectOrder = "UPDATE customerorder SET bartender = " + eid + ", is_open = 0 WHERE order_no = " + order_no;
        endpoint(selectOrder)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
    NEEDS TO BE TESTED
 */

router.route('/customer/drinks/order')
    .get(function (req, res) {
        var name = req.body.cust_name;
        var phone = req.body.phone_no;
        var table = req.body.table_no;
        var notes = req.body.notes;
        var open = 1;
        var bartender = null;
        var datetime = moment().format('YYYY-mm-dd hh:mm:ss');
        var createOrder = "INSERT INTO customerorder (date_time, bartender, is_open, notes, table_no, phone_no, cust_name) "
            + "VALUES (" + datetime + ", " + bartender + ", " + open + ", " + notes + ", " + table +  ", " + phone + ", "
            + "'" + name + "'" + ")";
        console.log(createOrder);
        endpoint(createOrder)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
        var order_no = "SELECT LAST_INSERT_ID()";
        endpoint(order_no)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
        var drinks = req.body.drinks;
        var drinksId = null;
        var drinksinorder = "INSERT INTO drinksinorder (order_no, drink_id) VALUES (" + order_no + ", " + drinksId + ")";
        for (var key in drinks) {
            drinksId = drinks[key];
            endpoint(drinksinorder)
                .then(function (result) {
                    res.json(result);
                }).catch(function (err) {
                console.error("Something went wrong, sorry");
            });
        }
        var amount = req.body.amount;
        var card_no = req.body.card_no;
        var payment = "INSERT INTO payment (amount, card_no, order_no) VALUES (" + amount + ", " + card_no + ", " + order_no + ")";
        endpoint(payment)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

// TODO: insert ingredient, customer receipt, add a new order, add order to bartender, custom drink
// TODO: Revenue statement, top 5 drinks, Whisky that has been served by all servers (admin report)
app.use('/', router);
app.listen(port);
console.log("Oh my..  we have a connection now at port:" + port + " don't we?");