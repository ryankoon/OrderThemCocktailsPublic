// middleware incase we need to do transformations of some sort.

function apiRouting(router, pool) {
var moment = require('moment');


var undefinedList = function undefinedArrayCheck(list){
	var out = [];
	for (var i=0; i < list.length;i++){
		if (list[i] === undefined){
			out.push(list[i]);
		}
	}
	return out;
}


router.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET");
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
                //console.log('Destroying a query');
                pool.end();
                reject(err.message);
            } else {
                var queryObject = {
                  sql : query,
                  timeout: 10000
                }
                //console.log('Proceeding to enter the query');
                console.log('Query is : ' + query);
                connection.query(queryObject, function (err, rows, col) {
                    if (err) {
                        console.log(err.message);
                        connection.release();
						if (res){
                        res.status(500).send({Error: 'Server error occurred when connecting to db : ' + JSON.stringify(err)});
											}
                        reject(err.message);
                    }
                    //console.log('Proceeding to release a query');
                    connection.release();
                    fulfill(rows);
                });
            }
        });
    });
}

/*
    Escape any characters that need escaping before sending the query string to the database

    Source:
    http://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly
 */
function escape_string (str) {
    if (typeof str != 'string')
        return str;

    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "'":
            case "\"":
            case "\\":
            case "%":
                return "\\"+char;
        }
    });
}

/*
 Endpoint for drink searching using ingredients via division.  This endpoint will return only drinks
 that contain the entire ingredient list;

 Pattern from source: https://www.simple-talk.com/sql/t-sql-programming/divided-we-stand-the-sql-of-relational-division/
*/
router.route('/drinks/withallingredients')
    .get(function (req, res){

        var makeView = makeViewString(escape_string(req.query.ingredient)),
            clearView = 'drop view if exists temp_drinkSearchByIngredient',
            doDivision = 'SELECT i.d_id FROM ingredientindrink i ' +
                         'LEFT OUTER JOIN temp_drinkSearchByIngredient t ON i.i_name = t.name GROUP BY i.d_id ' +
                         'HAVING COUNT(i.i_name) = (SELECT COUNT(name) FROM temp_drinkSearchByIngredient) AND ' +
                         'COUNT(t.name) = (SELECT COUNT(name) FROM temp_drinkSearchByIngredient)';

        endpoint(clearView)
            .then(function() {
                return endpoint(makeView);
            }).then(function() {
                return endpoint(doDivision);
            }).then(function(result) {
                res.json(result);
            }).catch(function (error) {
                console.error("error in /drinks/withingredients " + error);
            });

        function makeViewString (ingredients) {
            var view = "create view temp_drinkSearchByIngredient as select * from ingredient i where ";
            for (var i = 0; i < ingredients.length; i++) {
                view = view.concat("i.name=" + "'" + escape_string(ingredients[i]) + "'");

                if (i < ingredients.length - 1)
                    view += " or ";
            }
            return view;
        }
    });

router.route('/drinks/new')
    .post(function (req, res) {
        var name = req.body.name,
            ingredients = req.body.ingredient,
            id;

        var addDrinkQ = "insert into drink values (null, false, '" + escape_string(name) + "', null)",
            retrieveDrinkQ = "select id from drink where name='" + escape_string(name)+"'",
            id;

        endpoint(addDrinkQ)
            .then(function () {
            return endpoint(retrieveDrinkQ)
            }).then(function (result) {
                id = result[0].id;
                console.log(id);
                return endpoint(makeAddIngredientsToDrinkQuery(ingredients, id));
            }).then(function() {
                res.json(id);
            }).catch(function (error) {
                console.error("error in /drinks/new " + error);
            });


        function makeAddIngredientsToDrinkQuery(ingredients, id) {
            var insertString = "insert into ingredientindrink values ";

            for (var i=0; i < ingredients.length; i++) {
                insertString += "(" + id + ", '" + escape_string(ingredients[i]) + "')";

                if (i < ingredients.length - 1)
                    insertString += ",";
                else {
                    insertString += ";"
                }
            }
            return insertString;
        }
    });

/*
 Return only on-menu drinks where all ingredients are available
*/
router.route('/drinks/menu/available')
    .get(function (req, res) {
        var getDrinks = "select d_number.id, name, price " +

        "from (select d.id, d.name, d.on_menu, d.description, sum(i.price) as price, count(i_name) as ing_number " +
        "from drink d " +
        "join ingredientindrink iid " +
        "on d.id = iid.d_id " +
        "join ingredient i " +
        "on iid.i_name = i.name " +
        "where d.on_menu=true " +
        "group by d.id) " +
        "as d_number " +

        "join (select d2.id, count(i_name) as ing_avail " +
        "from drink d2 " +
        "join ingredientindrink iid2 " +
        "on d2.id = iid2.d_id " +
        "join ingredient i2 " +
        "on iid2.i_name = i2.name " +
        "where i2.available=true " +
        "group by d2.id) " +
        "as d_avail " +
        "on d_number.id = d_avail.id " +
        "where d_number.ing_number = d_avail.ing_avail ";

        endpoint(getDrinks)
            .then(function (result) {
                res.json(result)
            }).catch (function (error) {
            console.log("Error in /drinks/menu/available");
        })
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

 /**
 *  Get an alcoholic ingredient by name, regardless of availability
 */
router.route('/ingredients/alcoholic/:name')
    .get(function (req, res) {

        var showAlc,
            type = req.params.name;

            showAlc = "select a.name, a.abv, a.origin, a.type, i.description, i.available, i.price from alcoholicingredient a " +
                      "join ingredient i on i.name = a.name " +
                      "where a.name = " + "'" + escape_string(type) + "'";

        endpoint(showAlc)
            .then(function (result) {
            res.json(result);
        }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/**
 *  Get all alcoholic ingredients, regardless of availability
 */
router.route('/ingredients/all/alcoholic/')
    .get(function (req, res) {

        var showAlc = "select a.name, a.abv, a.origin, a.type, i.price, i.available from alcoholicingredient a " +
                      "join ingredient i on i.name = a.name ";

        endpoint(showAlc)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
                console.error("Something went wrong, sorry");
            });
    });

/**
 *  Get all garnishes, regardless of availability
 */
router.route('/ingredients/all/garnish/')
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

/**
 *  Get all non-alcoholic ingredients, regardless of availability
 */
router.route('/ingredients/all/nonalcoholic')
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

/**
 *  Get ingredients, regardless of availability
 */
router.route('/ingredients/name/:name')
    .get(function (req, res) {

        var showIng,
            type = req.params.name || "all";

        if (type == "all") {
            showIng = "select * from ingredient i where i.available=true"
        } else {
            showIng = "select i.name, i.price, i.description from ingredient i " +
                    "where i.name = " + "'" + escape_string(type) + "' and i.available=true";
        }

        endpoint(showIng)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
                console.error("Something went wrong, sorry");
            });
    });

/*
 sets the available value of all ingredients to 1
 */
router.route('/employee/admin/setAllIngredientsAvailable')
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
 gets all payments for open orders
 */
router.route('/employee/admin/openorderpayments')
    .get(function (req, res) {
        var openorderpayments = "SELECT p.payment_id, p.order_no, p.amount, p.card_no FROM payment p, " +
            "customerorder co WHERE p.order_no = co.order_no AND co.is_open = 1 ORDER BY p.payment_id DESC;";
        endpoint(openorderpayments)
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
        var addBartender = "insert into bartender (name) values ('" + escape_string(req.params.bartender) + "')";
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
        var addBartender = "DELETE FROM bartender where bartender.eid = " + escape_string(req.params.eid);
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

router.route('/employee/admin/ingredients/display/:attr/condition/:condition')
    .get(function (req, res) {
        var attr = req.params.attr;
        var condition = req.params.condition;
        var query;
        if (attr === "available") {
            query = "select name, available as value from ingredient where available = " + condition;
        } else if (attr === "price") {
            query = "select name, price as value from ingredient where price >= " + condition;
        }
        if (query) {
            endpoint(query)
                .then(function (result) {
                    res.json(result);
                }).catch(function (err) {
                console.error("Something went wrong, sorry");
            });
        }
    });

/*
 returns list employees who have served all drinks with whiskey ingredient
 keys: id, name
 */

router.route('/employee/admin/whiskeybartenders')
    .get(function (req, res) {
        var whiskeybartenders = "SELECT bsw.bartender AS id, b.name FROM bartendersservedwhiskey bsw, bartender b " +
            "WHERE bsw.bartender = b.eid GROUP BY bsw.bartender HAVING COUNT(bsw.bartender) = ( SELECT COUNT(*) " +
            "FROM drinkswithwhiskey )";
        endpoint(whiskeybartenders)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 returns list of drinks with whiskey that has been served by all bartenders
 keys: name
 */

router.route('/employee/admin/whiskeyservedbyall')
    .get(function (req, res) {
        var whiskeyservedbyall = "SELECT * FROM whiskeydrinkservedbyall";
        endpoint(whiskeyservedbyall)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 Shows the drink that has generated the max revenue
 */
router.route('/employee/admin/maxrevenuedrink')
    .get(function (req, res) {
        var revenue = "select drink, max(revenue) as max from (select drink.name as drink, sum(payment.amount) as revenue " +
            "from drinksinorder dio join customerorder co on dio.order_no = co.order_no " +
            "join drink on drink.id = dio.drink_id join payment on payment.order_no = co.order_no " +
            "where co.is_open = 0 group by drink.name order by revenue desc) as k";
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
            "where d_id = (select id from drink where name = '" + escape_string(req.params.drink) + "')";
        endpoint(showIngredients)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });


/*
 returns a list of orders that are open and has a drink
 */
router.route('/employee/bartender/openDrinks')
    .get(function (req, res) {
        var showOpenDrinks = "select co.order_no, co.cust_name, co.table_no, drink.name as drink, co.notes " +
            "from drinksinorder dio join customerorder co on dio.order_no = co.order_no " +
            "join drink on drink.id = dio.drink_id " +
            "where co.is_open = 1 order by co.order_no";
        endpoint(showOpenDrinks)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
    changes order from open to closed and adds bartender to order if bartender is null
 */
router.route('/employee/bartender/selectOrder/:eid/:order_no')
    .get(function (req, res) {
        var eid = req.params.eid;
        var order_no = req.params.order_no;
        var selectOrder = "UPDATE customerorder SET bartender = " + eid + ", is_open = 0 WHERE order_no = " + order_no +
            " AND bartender IS NULL";
        endpoint(selectOrder)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 returns info about the order and bartender given an order no
 */
router.route('/employee/order/:order_no')
    .get(function (req, res) {
        var order_no = req.params.order_no;
        var selectOrder = "SELECT * FROM customerorder c, bartender b WHERE c.bartender = b.eid AND c.order_no = " +
            order_no;
        endpoint(selectOrder)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

/*
 returns history of orders fulfilled by given bartender eid
 */

router.route('/employee/orderhistory/:eid')
    .get(function (req, res) {
        var eid = req.params.eid;
        var orderHistory = "SELECT c.date_time, c.order_no, c.cust_name, d.name AS drink FROM customerorder c, " +
            "bartender b, drinksinorder do, drink d WHERE c.order_no = do.order_no AND c.bartender = b.eid AND " +
            "do.drink_id = d.id AND c.bartender = " + eid;
        endpoint(orderHistory)
            .then(function (result) {
                res.json(result);
            }).catch(function(err) {
            console.error("Something went wrong, sorry");
        });
    });

router.route('/customer/drinks/order')
    .post(function (req, res) {
      /*
      Setup our variables!
      */
      var name, phone, table, notes, open, bartender, datetime, createOrder, customerEntry,
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
					console.log('here is phone : ' + phone);
				phone = parseInt(req.body.phone_no);
				console.log('here is phone converted : ' + phone);

        table = parseInt(req.body.table_no);
        }
        else{
          phone = req.body.phone_no;
          table = req.body.table_no;
        }


        name = escape_string(req.body.cust_name);
        notes = escape_string(req.body.notes);
        drinks = req.body.drinks;       // TODO: escape?
        amount = req.body.amount;
        card_no = req.body.card_no;
        var payloadList = [];
        payloadList.push(name);
        payloadList.push(notes);
        payloadList.push(drinks);
        payloadList.push(amount);
        payloadList.push(card_no);
        var out = [];
        out = undefinedList(payloadList);
        if (out.length > 0){
            res.status(404).send({Error: 'Please provide the correct payload: ' + JSON.stringify(out)});
          }
        open = 1;
        bartender = null;
        datetime = moment().format('YYYY-MM-DD').toString();

        createOrder = "INSERT INTO customerorder (date_time, bartender, is_open, notes, table_no, phone_no, cust_name) "
            + "VALUES ('" + datetime + "', " + bartender + ", " + open + ", '" + notes + "', " + table +  ", " + phone + ", "
            + "'" + name + "')";

        query_order_no = "SELECT LAST_INSERT_ID()";
        drinksId = null;

        var orderPromise = endpoint(createOrder);
        var orderNoPromise = endpoint(query_order_no);
        orderPromise.then(function (result) {
          console.log('we made it?');
          return orderNoPromise;
        }).then(function (order_no) {
          var foundOrderNumber = order_no[0]['LAST_INSERT_ID()'];
          for (var key in drinks) {
              drinksId = drinks[key];
              var drinksinorder = "INSERT INTO drinksinorder (order_no, drink_id) VALUES (" + foundOrderNumber + ", " + drinksId + ")";
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
            return endpoint(payment, res)
          }).then(function getPaymentID(result) {
            return endpoint('SELECT LAST_INSERT_ID()')
          }).then(function (result) {
              var id = result[0]['LAST_INSERT_ID()'];
              // need to get the last payment ID and send it back.
              res.status(200).send({Message: 'Successfully made order', paymentId : id});
          }).catch(function (err){
            res.status(404).send({Error: 'Database error : ' + JSON.stringify(err)});
            console.error(err);
          })
        }).catch(function (err){
           res.status(404).send({Error: 'Database error : ' + JSON.stringify(err)});
          console.error(err);
       });
    });

    router.route('/top5')
        .get(function (req, res) {
            var selectTop5 = "select d.name, COUNT(drink_id) as total from drinksinorder o, drink d where o.drink_id = d.id group by drink_id order by total DESC limit 0 , 5";
            console.log('entering this');
            endpoint(selectTop5)
                .then(function (result) {
                    res.json(result);
                }).catch(function (err){
                console.error("Something went wrong, sorry : " + err);
                res.json(err);
            });
        });

    router.route('/aggregatedrinkstats')
        .get(function (req,res){
            var aggType = escape_string(req.query.type);
                nestedQuery = "select " + aggType + "(frequency) as answer from " +
                              "(select c.cust_name as customer_name, count(co.cust_name) as frequency from customer c " +
                              "join customerorder co on (co.cust_name = c.cust_name and co.phone_no = c.phone_no) " +
                              "join drinksinorder dio on co.order_no = dio.order_no " +
                              "join drink d on dio.drink_id = d.id " +
                              "where co.is_open = 0 " +
                              "group by customer_name) as k;";
            endpoint(nestedQuery)
                .then(function (result) {
                    res.json(result);})
                .catch(function (error) {
                    console.error("There was an error in /aggregatedrinkstats " + error)
                })
        });

    router.route('/insertCustomer')
        .post(function (req, res){
            var name = req.body.name;
            var phone = req.body.phone;
            var customerEntry = "INSERT INTO customer(cust_name, phone_no) " + "VALUES ('" + name +	"'," + phone + ")";
            endpoint(customerEntry).then(function(){
                res.status(200).send({Message: 'Successfully added person to the db'});
            }).catch(function(err){
                res.status(404).send({Error: 'Errored out added to db: ' + err});
            });
        });
    router.route('/deletePayment:id')
        .delete(function (req, res) {
            // console.log("insert into bartender (name) values (" + req.params.bartender + ")");
            var addBartender = "DELETE FROM payment where payment.payment_id = " + escape_string(req.params.id);
            endpoint(addBartender)
                .then(function (result) {
                    res.json(result);
                }).catch(function(err) {
                console.error("Something went wrong when deleting from bartender, sorry");
            });
        });
};

module.exports.apiRouting = apiRouting;

return module
