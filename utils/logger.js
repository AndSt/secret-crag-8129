
var mysql = require('mysql');
var connection = require('./database').getConnection();

/*
 * We following loggin levels are proposed:
 * - DEBUG
 * - ERROR 
 * - INFO
 */

var log = function (text, level) {
    connection.query("INSERT INTO `Log`( `text`, `level`) " +
            "VALUES ('" + text + "', '" + level + "')",
            function (err) {
                if (err) {
                    console.log("The logger collapsed");
                }
            });

};

module.exports = {
    log: log
};


