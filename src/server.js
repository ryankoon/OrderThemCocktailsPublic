/**
 * Created by Alek Hrycaiko on 2016-10-16.
 */

// Connect to db
var mysql = require('mysql');

var connection = mysql.createConnection({
    host : '???',
    user : 'cpsc304admin',
    password: 'Hicarpwatcher1',
    database: 'cpsc304-db'
});

connection.connect();

connection.query('SELECT SOME STUFF AND MAKE A QUERY'), function (err, rows, columns) {
    if (err) {
        throw new Error;
    }
    console.log('BOOM!');
}

connection.end();