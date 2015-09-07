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
            var number = typeof partials[2] === 'undefined' ? 1000 : partials[2];
            circuitConn.getLastItems(item.convId, number, function (err, items) {
                if (err) {
                    callback(false, "An error occured. Please try again.");
                }
                else {

                    var numberOfTextMessages = [];
                    var numberOfLetters = [];

                    for (var i = 0; i < conv.participants.length; i++) {
                        numberOfTextMessages[i] = 0;
                        numberOfLetters[i] = 0;
                    }

                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type === "TEXT") {
                            numberOfTextMessages[i] += 1;
                            numberOfLetters[i]
                                    += items[i].text.content.length;
                        }
                    }


                    logger.info("Statistiken: " +
                            numberOfTextMessages.toString());

                    callback(false, "Läuft gut");
                }
            });
        }
    });


};

module.exports = {
    analyzeTextItems: analyzeTextItems
};


