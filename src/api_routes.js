// middleware incase we need to do transformations of some sort.

function apiRouting(router, pool) {
var moment = require('moment');
router.use(function (req, res, next){
    next();
});
/*
returns a promise from making an endpoint request.
 */
function endpoint(query, res) {
    return new Promise(function (fulfill, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("Error: " + err.message);
                console.log('Destroying a query');
                pool.end();
                reject(err.message);
            } else {
                var queryObject = {
                  sql : query,
                  timeout: 10000
                }
                console.log('Proceeding to enter the query');
                console.log('Query is : ' + query);
                connection.query(queryObject, function (err, rows, col) {
                    if (err) {
                        console.log(err.message);
                        connection.release();
                        res.status(500).send({Error: 'Server error occurred when connecting to db'});
                        reject(err.message);
                    }
                    console.log('Proceeding to release a query');
                    connection.release();
                    if (res){
                      res.sendStatus(200);
                    }
                    fulfill(rows);
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

router.route('/ingredients/type')
    .get(function (req, res) {
        var showAllAlcoholic = "select * from alcoholictype";
        endpoint(showAllAlcoholic)
            .then(function (result) {
            res.json(result);
        }).catch(function (err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/ingredients/name/:name')
    .get(function (req, res) {
        var getIngredientByName = 'select a.name, i.description, a.abv, a.origin, a.type, i.available from alcoholicingredient a ' +
            'join ingredient i on i.name = a.name where  i.name =' + "'" + req.params.name +"'";
        endpoint(getIngredientByName)
            .then(function (result) {
                res.json(result)
            })
            .catch(function (err) {
                console.error("error in ingredients/name/:name");
            })
    });

/*
    ex. ingredients/base/Vodka
 */
router.route('/ingredients/base/:type')
    .get(function (req, res) {
        // console.log("type" + JSON.stringify({type:req.params.type}));
        var showBase;

        if (req.params.type === "all") {
            showBase = "select a.name, a.abv, a.origin, a.type, i.available from alcoholicingredient a " +
                "join ingredient i on i.name = a.name where i.available=true";
        } else {
            showBase = "select a.name, a.abv, a.origin, a.type, i.available from alcoholicingredient a " +
                "join ingredient i on i.name = a.name " +
                " where a.type = " + "'" + req.params.type + "'";
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
        var showNonAlcoholic = "select ingredient.name, price, available, description from ingredient " +
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
        var showBartender = "select eid as id, name from bartender";
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

router.route('/employee/admin/removestaff/:eid')
    .delete(function (req, res) {
        // console.log("insert into bartender (name) values (" + req.params.bartender + ")");
        var addBartender = "DELETE FROM bartender where bartender.eid = " + req.params.eid;
        endpoint(addBartender)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong when deleting from bartender, sorry");
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
    .post(function (req, res) {
      /*
      Setup our variables!
      */
      var name, phone, table, notes, open, bartender, datetime, createOrder,
        amount, card_no, drinks,
        promiseArray, secondPromiseArray,
        createOrder, lastOrder, query_order_no, drinksId, drinksinorder,
        open;

        /*
        Variable setting.
        */
        promiseArray = [];
        secondPromiseArray = [];
          console.log(req.body);

        if (typeof req.body.phone_no === "string" || typeof req.body.table_no === "string") {
          phone = parseInt(req.body.phone_no);
          table = parseInt(req.body.table_no);
        }
        else{
          phone = req.body.phone_no;
          table = req.body.table_no;
        }


        name = req.body.cust_name;
        notes = req.body.notes;
        drinks = req.body.drinks;
        amount = req.body.amount;
        card_no = req.body.card_no;

        if (name === undefined || phone === undefined || table === undefined
          || notes === undefined || drinks === undefined || amount === undefined || card_no === undefined){
            res.status(404).send({Error: 'Please provide the correct payload: ' + JSON.stringify(req.body)});
          }

        open = 1;
        bartender = null;
        datetime = moment().format('YYYY-MM-DD').toString();

        createOrder = "INSERT INTO customerorder (date_time, bartender, is_open, notes, table_no, phone_no, cust_name) "
            + "VALUES ('" + datetime + "', " + bartender + ", " + open + ", '" + notes + "', " + table +  ", " + phone + ", "
            + "'" + name + "')";
        query_order_no = "SELECT LAST_INSERT_ID()";
        drinksId = null;
        /*
        Setup a series of promises to later resolve.

        first run create order.

        then run the array of drinks.

        then run the payment query
        */
        var orderPromise = endpoint(createOrder);
        var orderNoPromise = endpoint(query_order_no);
        // we need order_no to be the result
        orderPromise.then(function (result) {
          console.log('we made it?');
          return orderNoPromise; // this isnt fulfilled imo.
        //  .then(function (result) { // !!! here... need order_no from promise.
        //    return result;
        //  });
        }).then(function (order_no) {
          var foundOrderNumber = order_no[0]['LAST_INSERT_ID()'];
          console.log("Here is order number" +  JSON.stringify(order_no));
          var drinksinorder = "INSERT INTO drinksinorder (order_no, drink_id) VALUES (" + foundOrderNumber + ", " + drinksId + ")";

          for (var key in drinks) {
              drinksId = drinks[key];
              var drinkPromise = endpoint(drinksinorder);
              secondPromiseArray.push(drinkPromise);
          }
          return foundOrderNumber;
        }).then(function (ourNumber) {
          var blockScope_order_no = ourNumber;
          Promise.all(secondPromiseArray, function (result) {
            return;
          }).then(function () {
            var payment = "INSERT INTO payment (amount, card_no, order_no) VALUES (" + amount + ", " + card_no + ", " + blockScope_order_no + ")";
            return endpoint(payment, res);
          }).catch(function (err){
            res.status(404).send({Error: 'Database error : ' + err});
            console.error(err);
          })
        }).catch(function (err){
          res.status(404).send({Error: 'Database error : ' + err});
          console.error(err);
        });
    });
	};
	module.exports.apiRouting = apiRouting;

	return module
