function uiRouting(app) {
	var request = require('request');

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

	  request('http://localhost:8080/api/customer/drinks', function (err, resp, body){
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
	app.get('/custom', function (req, res) {
	// need to make an API call and split everything into groups of 3.
	// need go... [ [{}, {}, {}]. [{}, {}, {} ]
	// #each array
	//  #each item
	      // item.blah item.nah

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
