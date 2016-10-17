/**
 * Created by Alek Hrycaiko on 2016-10-16.
 */

// Connect to db
var mysql = require('mysql');
var credentials = require('./../credentials.json');

var connection = mysql.createConnection({
    host : credentials.host,
    user: credentials.username,
    password: credentials.password
})

connection.connect(function (err){
    console.log('Attempting to connect to MySQL');
    if (err){
       console.log('Errored out connecting : ' + err);
   }
});

// TODO: Generate a query so this doesnt fail.
connection.query('SELECT SOME STUFF AND MAKE A QUERY'), function (err, rows, columns) {
    if (err) {
        console.log(err);
    }
    console.log('BOOM! We did a query');
}

connection.end();