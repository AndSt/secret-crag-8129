var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var circuitConn = require('./communication');

/*  
 * 
 */
var analyzeTextItems = function (item, partials) {
    logger.info("Textanalyzer: started analyzeTextItems");
    return new Promise(function (resolve, reject) {
        circuitConn.getConversation(item.convId)
                .then(function (conv) {

                    var number = typeof partials[2] === 'undefined' ? 100 : partials[2];
                    circuitConn.getLastItems(item.convId, number)
                            .then(function (items) {
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
                                    logText = logText + JSON.stringify(stats[participants[i]]);
                                }

                                logger.info("Statistiken für " + items.length +
                                        "Items: " + ",!!! " + logText);
                                resolve(Läuft);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};
var analyzeLikes = function () {
    
};
module.exports = {
    analyzeTextItems: analyzeTextItems
};


