

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'sql2.freemysqlhosting.net',
    user: 'sql288857',
    password: 'vB6*pR5!',
    port: '3306',
    database: 'sql288857'
});

var connected = false;

connection.connect(function (err) {
    if (!err) {
        connected = true;
        console.log("Database is connected ... \n\n");
    } else {
        console.log("Error connecting database ... \n\n");
    }
});



connection.end();