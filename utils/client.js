var Circuit = require('circuit');
var logger = require('./logger');

var client = new Circuit.Client({domain: 'circuitsandbox.net'});
client.logon('andreas-stephan@hotmail.de', 'andalos1')
        .then(function (user) {
            logger.info('Logged in as ' + user.displayName);
        }).catch(function (e) {
    logger.error('Unable to logon. ' + e);
});

var getClient = function () {
    return client;
};


module.exports.getClient = function () {
    return client;
};