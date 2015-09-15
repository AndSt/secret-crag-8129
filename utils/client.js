
//var config = require('./../config/config.json');

var Circuit = require('circuit');
var logger = require('./logger');

/*
 * Login the client and return the object 
 */

//if (config.test === false) {

var client = new Circuit.Client({domain: 'circuitsandbox.net'});
client.logon('andreas-stephan@hotmail.de', 'andalos1')
        .then(function (user) {
            logger.info('Logged in as ' + user.displayName);
        })
        .catch(function (err) {
            logger.error('Unable to logon. ' + err);
        });

//}

var getClient = function () {
    return client;
};


module.exports.getClient = function () {
    return client;
};