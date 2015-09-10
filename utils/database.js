var mysql = require('mysql');


var connection = mysql.createConnection({
    host: 'sql2.freemysqlhosting.net',
    user: 'sql288857',
    password: 'vB6*pR5!',
    port: '3306',
    database: 'sql288857'
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
module.exports.getConnection = function() {
    return connection;
};
