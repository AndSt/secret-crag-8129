
var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();

/*
 * We following loggin levels are possible:
 * - DEBUG
 * - Error 
 * - INFO
 */

var log = function (text, level) {
    connection.query("INSERT INTO `Log`( `text`, `type`) " +
            "VALUES ('" + text + "', '" + level + "')",
    function(err){
        console.log("The logger collapsed");
    });
};

module.exports = {
    log: log
};



