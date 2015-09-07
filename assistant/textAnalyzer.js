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

                    var participants = conv.participants;
                    var stats = [];

                    for (var i = 0; i < participants.length; i++) {
                        console.log("Participant " + participants[i]);
                        stats[participants[i]] = {
                            numMessages: 0,
                            numLetters: 0
                        };
                    }

                    logger.info("Das " + participants.length + " Array: " +
                            JSON.stringify(stats[participants[0]]));

                    for (var j = 0; j < items.length; j++) {
                        if (items[j].type === "TEXT") {
                            stats[items[j].creatorId].numMessages += 1;
                            stats[items[j].creatorId].numLetters
                                    += stats[j].text.content.length;
                            logger.info("Stats " + stats[items[j].creatorId]);
                        }
                    }


                    logger.info("Statistiken für " + items.length + "Items: " +
                            JSON.stringify(stats));

                    callback(false, "Läuft gut");
                }
            });
        }
    });


};

module.exports = {
    analyzeTextItems: analyzeTextItems
};


