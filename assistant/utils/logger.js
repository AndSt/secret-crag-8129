
var config = require('./../config.json');

/*
 * We following loggin levels are proposed:
 * - DEBUG
 * - INFO
 * - ERROR 
 */
var log = function (text, level) {
    console.log("[APP] " + level + ": " + text);
};

var debug = function (text) {
    if (config.logLevel.level === "DEBUG") {
        log(text, 'DEBUG');
    }
};

var info = function (text) {
    if (config.logLevel.level !== "ERROR") {
        log(text, 'INFO');
    }
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





