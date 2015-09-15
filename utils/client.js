var Circuit = require('circuit');
var logger = require('./logger');

/*
 * Login the client and return the object 
 */


var client = new Circuit.Client({domain: 'circuitsandbox.net'});
console.log("test");ölkjölj
client.authenticate({email: 'andreas-stephan@hotmail.de', password: 'andalos1'})
        .then(function () {
            console.log("logged in ");
        })
        .catch(function () {
            console.log("not logged in");
        });
//client.logon('andreas-stephan@hotmail.de', 'andalos1')
//        .then(function (user) {
//            console.log("eingeloggt");
////            logger.info('Logged in as ' + user.displayName);
//        })
//        .catch(function (err) {
//            logger.error('Unable to logon. ' + err);
//        });

var getClient = function () {
    return client;
};


module.exports.getClient = function () {
    return client;
};