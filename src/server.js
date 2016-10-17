/**
 * Created by Alek Hrycaiko on 2016-10-16.
 */

// Connect to db
var mysql = require('mysql');

try {
    var credentials = require("./credentials");
    var jsonCredentials = JSON.parse(credentials);
}
catch(err){
    throw new Error('Error obtaining credentials for db login');
}

var connection = mysql.createConnection({
    host : jsonCredentials.host,
    user : jsonCredentials.username,
    password: jsonCredentials.password,
    database: jsonCredentials.connectionString
});

connection.connect();

connection.query('SELECT SOME STUFF AND MAKE A QUERY'), function (err, rows, columns) {
    if (err) {
        throw new Error;
    }
    console.log('BOOM!');
}

connection.end();