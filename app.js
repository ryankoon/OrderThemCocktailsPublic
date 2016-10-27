var express = require('express');
var path = require('path');
var routes = require('./routes/index');

var app = express();

// set up static path
app.use('/static', express.static(path.join(__dirname, 'static')));

// set up routing
app.use('/', routes);

// listen on port
app.listen(8080);

// 404 error handler
app.use(function(req, res, next) {
    res.status(404).send({responseCode: 404, message: 'Not Found'});
});

// 500 error handler
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({responseCode: 500, message: 'Internal Server Error'});
});



module.exports = app;
