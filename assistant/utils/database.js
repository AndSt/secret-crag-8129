var mysql = require('mysql');

var config = require("./../config.json").database;

//var connection = mysql.createConnection({
//    host: 'sql2.freemysqlhosting.net',
//    user: 'sql288857',
//    password: 'vB6*pR5!',
//    port: '3306',
//    database: 'sql288857'
//});

var connection = mysql.createConnection({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    port: config.dbPort,
    database: config.dbDatabase
});


connection.connect(function (err) {
    if (!err) {
        connected = true;
        console.log("Database is connected ... \n\n");
    } else {
        console.log("Error connecting database ... \n\n");
    }
});


//returns connection for all modules
module.exports.getConnection = function () {
    return connection;
};
