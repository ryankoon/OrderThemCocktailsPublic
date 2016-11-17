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

	  request(apiRoot + '/customer/drinks', function (err, resp, body){
	   var outcomeNamesArray = [];
	    var jsonObject = JSON.parse(body);
	    res.render('customer', {
	      drink : jsonObject
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
	  res.render('adminhome');
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
