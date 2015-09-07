var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var circuitConn = require('./communication');


/*  
 * 
 */
var analyzeTextItems = function (item, partials, callback) {
    logger.info("Textanalyzer: started analyzeTextItems");
    circuitConn.getConversation(item.convId, function (err, conv) {
        if (err) {
            callback(false, "An error occured. Please try again.");
        }
        else {
            var number = partials[2] === 'undefined' ? 1000 : partials[2];
            circuitConn.getLastItems(item.convId, number, function (err, items) {
                if (err) {
                    callback(false, "An error occured. Please try again.");
                }
                else {
                    
                    var participants;
                    var numberOfTextMessages = [];
                    
                    
                    callback(false, "Läuft gut");
                }
            });
        }
    });


};

module.exports = {
    analyzeTextItems: analyzeTextItems
};


