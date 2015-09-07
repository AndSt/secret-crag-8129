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

                    var numberOfTextMessages = [];
                    var numberOfLetters = [];

                    for (var i = 0; i < conv.participates.length; i++) {
                        numberOfTextMessages[conv.participants[i]] = 0;
                        numberOfLetters[conv.participants[i]] = 0;
                    }

                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type === "TEXT") {
                            numberOfTextMessages[items[i].creatorId] += 1;
                            numberOfLetters[items[i].creatorId]
                                    += items[i].text.content.length;
                        }
                    }

                    logger.info("Statistiken: " +
                            JSON.stringify(numberOfTextMessages));

                    callback(false, "Läuft gut");
                }
            });
        }
    });


};

module.exports = {
    analyzeTextItems: analyzeTextItems
};


