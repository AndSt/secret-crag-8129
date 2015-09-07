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

                    var map = new Map();
                    for (var i = 0; i < conv.participants.length; i++) {
                        map.set(conv.participants[i], {
                            numMessages: 0,
                            numLetters: 0
                        });
                    }

                    var tmp;
                    for (i = 0; i < items.length; i++) {
                        if (items[i].type === "TEXT") {
                            tmp = map.get(items[i].creatorId);
                            tmp.numMessages += 1;
                            tmp.numLetters  += items[i].text.content.length;
                            map.set(items[i].creatorId, tmp);
                        }
                    }


                    logger.info("Statistiken für " + items.length + "Items: " +
                            map.toString());

                    callback(false, "Läuft gut");
                }
            });
        }
    });


};

module.exports = {
    analyzeTextItems: analyzeTextItems
};


