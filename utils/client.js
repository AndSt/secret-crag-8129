
var config = require('./../assistant/config.json').client;

var Circuit = require('circuit');

/*
 * Login the client and return the object 
 */

//if (config.test === false) {

var client = new Circuit.Client({domain: config.domain});
client.logon(config.userName, config.password)
        .then(function (user) {
            console.log('Logged in as ' + user.displayName);
        })
        .catch(function (err) {
            console.log('Unable to logon. ' + err);
        });

//}

var getClient = function () {
    return client;
};

module.exports.getClient = function () {
    return client;
};