
var mysql = require('mysql');
var connection = require('./../assistant/utils/database').getConnection();

/*
 * We following loggin levels are proposed:
 * - DEBUG
 * - INFO
 * - ERROR 
 */
var log = function (text, level) {
    console.log("[APP]: " + level + ": " + text);
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



