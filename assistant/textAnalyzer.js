var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var circuitConn = require('./communication');


/*  
 * 
 */
var analyzeTextItems = function (item, partials, callback) {
    logger.info("Textanalyzer: started analyzeTextItems");
    circuitConn.getConversation(item.convId, function (err, val) {
        if (err) {
            callback(false, val);
        }
        else {
            var number = partials[2] === 'undefined' ? 1000 : partials[2];
            circuitConn.getLastItems(item.convId, number, function (err, items) {
                if (err) {
                    callback(false, JSON.stringify(items));
                }
                else {
                    //doSomething with the items;
                    callback(false, "Läuft gut");
                }
            });
        }
    });


};

module.exports = {
    analyzeTextItems: analyzeTextItems
};


