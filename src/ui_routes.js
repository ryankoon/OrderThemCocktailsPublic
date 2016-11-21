function uiRouting(app, hbs) {

	var apiRoot = 'http://localhost:8080/api',
	request = require('request');

	/*
	Home route for customers to input information.
	*/
	app.get('/', function (req,res){
	  res.render('home');
	});

	/*
	Customer order route.
	*/
	app.get('/customer', function (req, res) {

		var promiseFirst = new Promise(function (fulfill, reject) {
			request.get(apiRoot + '/top5', function (err, resp, body) {
				if (err) {
					console.error('Error getting top5');
					res.status(404).send({Error: 'Error contacting the db:' + err});
					reject(err);
				}
				var top5Json = JSON.parse(body);
				console.log(top5Json);
				fulfill(top5Json);
			});
		});

		promiseFirst.then(function (top5Result) {
			request.get(apiRoot + '/drinks/menu/available', function (err, resp, body) {
				if (err) {
					console.error('Error getting drinks:' + err);
					res.status(404).send({Error: 'Error contacting the db:'} + err)
				}
				var jsonObject = JSON.parse(body);
				res.render('customer', {
					drink: jsonObject,
					top5: top5Result
				})
			});
		});
	});

	/*
	Custom drink route.
	*/
	app.get('/customer/customdrink', function (req, res) {
		var ingredientPromises = [],
			alcoholic,
			nonalcoholic,
			garnish;

		ingredientPromises.push(new Promise(function (resolve, reject) {
			request(apiRoot + '/ingredients/all/alcoholic/', function (error, response, body) {
				if (error) {
					reject(error)
				} else {
					alcoholic = JSON.parse(body);
					resolve(alcoholic);
				}
			});
		}));

		ingredientPromises.push(new Promise(function (resolve, reject) {
			request(apiRoot + '/ingredients/all/nonalcoholic/', function (error, response, body) {
				if (error) {
					reject(error)
				} else {
					nonalcoholic = JSON.parse(body);
					resolve();
				}
			});
		}));

		ingredientPromises.push(new Promise(function (resolve, reject) {
			request(apiRoot + '/ingredients/all/garnish/', function (error, response, body) {
				if (error) {
					reject(error)
				} else {
					garnish = JSON.parse(body);
					resolve();
				}
			});
		}));

		Promise.all(ingredientPromises)
			.then(function () {
				res.render('customdrink',
					{
						alcoholic: alcoholic,
						nonalcoholic: nonalcoholic,
						garnish: garnish
					}
				)})
			.catch(function (error) {
				console.log(error)
			});
	});


	app.get('/employee', function (req,res){
	  res.render('employeelogin');
	});

	app.get('/admin', function (req,res){
		var attr = req.query.attr;
		var condition = req.query.condition;
		console.log(attr, condition);
		var ingredients,
			employees,
			whiskeyBartenders,
			whiskeyservedbyall,
			top5Drinks,
			maxRevenueDrink;

		var adminPromises = [];
		var adminpromise;
		var apiEndpoint = '/employee/admin/ingredients/display/available/condition/0';
		if (attr && condition) {
			apiEndpoint = '/employee/admin/ingredients/display/' + attr + "/condition/" + condition;
		}
		adminpromise = new Promise(function (resolve, reject) {
			request(apiRoot + apiEndpoint, function (error, response, body) {
				if (error) {
					reject(error);
				} else {
					ingredients = JSON.parse(body);
					console.log("ingredients", ingredients);
					resolve(body);
				}
			});
		});
		adminPromises.push(adminpromise);

		adminpromise = new Promise(function (resolve, reject) {
			request(apiRoot + '/employee/admin/staff', function (error, response, body) {
				if (error) {
					reject(error);
				} else {
					employees = JSON.parse(body);
					resolve(body);
				}
			});
		});
		adminPromises.push(adminpromise);

		adminpromise = new Promise(function (resolve, reject) {
			request.get(apiRoot + '/employee/admin/whiskeybartenders', function (err, resp, body) {
				if (err) {
					console.error('Error getting whiskey bartenders:' + err);
					reject(err);
				} else {
					whiskeyBartenders = JSON.parse(body);
					resolve(body);
				}
			});
		});
		adminPromises.push(adminpromise);

		adminpromise = new Promise(function (resolve, reject) {
			request.get(apiRoot + '/employee/admin/whiskeyservedbyall', function (err, resp, body) {
				if (err) {
					console.error('Error getting whiskey bartenders:' + err);
					reject(err);
				} else {
					whiskeyservedbyall = JSON.parse(body);
					resolve(body);
				}
			});
		});
		adminPromises.push(adminpromise);

		adminpromise = new Promise(function (resolve, reject) {
			request.get(apiRoot + '/top5', function (err, resp, body) {
				if (err) {
					console.error('Error getting drinks:' + err);
					reject(err);
				} else {
					top5Drinks = JSON.parse(body);
					resolve(body);
				}
			});
		});
		adminPromises.push(adminpromise);

		adminpromise = new Promise(function (resolve, reject) {
			request.get(apiRoot + '/employee/admin/maxrevenuedrink', function (err, resp, body) {
				if (err) {
					console.error('Error getting drinks:' + err);
					reject(err);
				} else {
					maxRevenueDrink = JSON.parse(body);
					resolve(body);
				}
			});
		});
		adminPromises.push(adminpromise);

		Promise.all(adminPromises)
			.then(function() {
				res.render('adminhome', {
					ingredients: ingredients,
					employees: employees,
					whiskeyBartenders: whiskeyBartenders,
					whiskeyservedbyall: whiskeyservedbyall,
					top5Drinks: top5Drinks,
					maxRevenueDrink: maxRevenueDrink
				});
			}).catch(function(err) {
			res.status(404).send({Error: 'Error contacting the db:'} + err)
		});
	});
	app.get('/bartender/:eid', function (req,res){
		function groupOrdersResponse(body) {
			var bodyJSON = JSON.parse(body);
			var groupedOrders = {};
			// group orders
			if (bodyJSON) {
				for (var i = 0; i < bodyJSON.length; i++) {
					var orderNo = bodyJSON[i].order_no;
					var drinkName = bodyJSON[i].drink;
					if (!groupedOrders[orderNo]) {

						//store first entry found for an orderid
						groupedOrders[orderNo] = bodyJSON[i];

						// store drinks as an array or drink objects
						// key - drink name
						// value - number of drinks
						delete groupedOrders[orderNo].drink;
						groupedOrders[orderNo].drinks = {};
						groupedOrders[orderNo].drinks[drinkName] = 1;
					} else {
						var drinkAmount = groupedOrders[orderNo].drinks[drinkName];
						if (!drinkAmount) {
							groupedOrders[orderNo].drinks[drinkName] = 1;
						} else {
							groupedOrders[orderNo].drinks[drinkName] += 1;
						}
					}
				}
			}

			// Hashed orders to array
			var groupedOrdersArray = [];
			var orderNos = Object.keys(groupedOrders);
			for (var n = 0; n < orderNos.length; n++) {
				//separate drink key value pairs into an array of drink objects
				var drinksObject = groupedOrders[orderNos[n]].drinks;
				var drinkNames = Object.keys(drinksObject);
				var drinksArray = [];

				for (var m = 0; m < drinkNames.length; m++) {
					var drinkObject = {};
					drinkObject[drinkNames[m]] = drinksObject[drinkNames[m]];
					drinksArray.push(drinkObject);
				}

				// replace object representation with array representation of drinks
				groupedOrders[orderNos[n]].drinks = drinksArray;
				groupedOrdersArray.push(groupedOrders[orderNos[n]]);
			}
			console.log("GroupedOrdersArray", groupedOrdersArray);
			return groupedOrdersArray;
		}

		var eid = req.params.eid;
		var openOrders,
			ordersHistory;

		var bartenderPromises = [];
		var bartenderpromise;
		bartenderpromise = new Promise(function (resolve, reject) {
			request(apiRoot + '/employee/bartender/openDrinks', function (error, response, body) {
				if (error) {
					reject(error);
				} else {
					openOrders = groupOrdersResponse(body);
					resolve(body);
				}
			});
		});
		bartenderPromises.push(bartenderpromise);

		bartenderpromise = new Promise(function (resolve, reject) {
			request(apiRoot + '/employee/orderhistory/' + eid, function (error, response, body) {
				if (error) {
					reject(error);
				} else {
					ordersHistory = groupOrdersResponse(body);
					console.log(ordersHistory);
					resolve(body);
				}
			});
		});
		bartenderPromises.push(bartenderpromise);


		Promise.all(bartenderPromises)
			.then(function() {
				res.render('bartenderhome', {
					openOrders: openOrders,
					ordersHistory: ordersHistory
				});
			}).catch(function(err) {
			res.status(404).send({Error: 'Error contacting the db:'} + err)
		});
	});

	app.get('/getgarnishes', function (req,res) {
	  request('http://localhost:8080/api/ingredients/garnish', function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	     res.send(body);
	    }
	  });
	});
}
module.exports.uiRouting = uiRouting;
