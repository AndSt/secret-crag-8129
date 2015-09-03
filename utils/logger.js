
var mysql = require('mysql');
var connection = require('./database').getConnection();

/*
 * We following loggin levels are proposed:
 * - DEBUG
 * - ERROR 
 * - INFO
 */

var log = function (text, level, callback) {
    connection.query("INSERT INTO `Log`( `text`, `type`) " +
            "VALUES ('" + text + "', '" + level + "')",
            function (err) {
                if (err) {
                    callback(true);
                    console.log("The logger collapsed");
                }
                else {
                    callback(false);
                }
            });

};

module.exports = {
    log: log
};



