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
            var number = typeof partials[2] === 'undefined' ? 25 : partials[2];
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
                            userId: participants[i],
                            numMessages: 0,
                            numLetters: 0
                        };
                    }

                    var text;
                    for (var j = 0; j < items.length; j++) {
                        if (items[j].type === "TEXT") {
                            stats[items[j].creatorId].numMessages += 1;
                            text = items[j].text.content;
                            stats[items[j].creatorId].numLetters 
                                    += text.length;
                        }
                    }

                    var logText = "";
                    for (i = 0; i < participants.length; i++) {
                        logText = logText + JSON.stringify(stats[participant[i]]);
                    }

                    logger.info("Statistiken für " + items.length + "Items: " +
                            JSON.stringify(stats));

                    callback(false, "Läuft gut");
                }
            });
        }
    });
};

var analyzeLikes = function(){
    
};

module.exports = {
    analyzeTextItems: analyzeTextItems
};


