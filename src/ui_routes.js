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
			request.get(apiRoot + '/customer/drinks', function (err, resp, body) {
				if (err) {
					console.error('Error getting drinks:' + err);
					res.status(404).send({Error: 'Error contacting the db:'} + err)
				}
				var jsonObject = JSON.parse(body);
				res.render('customer', {
					drink: jsonObject,
					top5: top5Result
				})
			}).catch(function (err){
				console.error(err);
				res.status(404).send({Error: 'Error contacting the db:'} + err)
			});
		});

	});

	/*
	Custom drink route.
	*/
	app.get('/customer/customdrink', function (req, res) {
		console.log("hit the custom drink route ok");
		var ingredientPromises = [],
			alcoholic,
			nonalcoholic,
			garnish;

		ingredientPromises.push(new Promise(function (resolve, reject) {
			request(apiRoot + '/ingredients/base/all', function (error, response, body) {
				if (error) {
					reject(error)
				} else {
					alcoholic = JSON.parse(body);
					resolve(alcoholic);
				}
			});
		}));

		ingredientPromises.push(new Promise(function (resolve, reject) {
			request(apiRoot + '/ingredients/nonalcoholic', function (error, response, body) {
				if (error) {
					reject(error)
				} else {
					nonalcoholic = JSON.parse(body);
					resolve();
				}
			});
		}));

		ingredientPromises.push(new Promise(function (resolve, reject) {
			request(apiRoot + '/ingredients/garnish', function (error, response, body) {
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
		var garnishes;
		var employees;
		var top5Drinks;

		var adminPromises = [];
		var adminpromise;
		adminpromise = new Promise(function (resolve, reject) {
			request(apiRoot + '/employee/admin/availability', function (error, response, body) {
				if (error) {
					reject(error);
				} else {
					garnishes = JSON.parse(body);
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

		Promise.all(adminPromises)
			.then(function() {
				res.render('adminhome', {
					garnishes: garnishes,
					employees: employees,
					top5Drinks: top5Drinks
				});
			}).catch(function(err) {
			res.status(404).send({Error: 'Error contacting the db:'} + err)
		});
	});
	app.get('/bartender', function (req,res){
	  res.render('bartenderhome');
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
