
var mysql = require('mysql');
var connection = require('./database').getConnection();

/*
 * We following loggin levels are proposed:
 * - DEBUG
 * - INFO
 * - ERROR 
 */
var log = function (text, level) {
    connection.query("INSERT INTO `Log`( `text`, `level`) " +
            "VALUES ('" + text + "', '" + level + "')",
            function (err) {
                if (err) {
                    console.log("[APP]: The logger collapsed");
                }
                else {
                    console.log("[APP]: " + level + ". " + text);
                }
            });

};

var debug = function (text) {
    log(text, 'DEBUG');
};

var info = function (text) {
    log(text, 'INFO');
};

var error = function (text) {
    log(text, 'ERROR');
};

module.exports = {
    log: log,
    debug: debug,
    info: info,
    error: error
};



