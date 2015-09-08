var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var circuitConn = require('./communication');

/*  
 * 
 */
var getTextItemNumbers = function (convId, numer) {

    return new Promise(function (resolve, reject) {
        circuitConn.getConversation(convId)
                .then(function (conv) {

                    circuitConn.getLastItems(convId, number)
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
                                resolve(stats);
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

var analyzeConversation = function (item, partials) {
    var number = typeof partials[2] === 'undefined' ? 100 : partials[2];

    logger.info("Textanalyzer: started analyzeTextItems");

    getTextItemNumbers(item.convId, number)
            .then(function (data) {

                var color = [];
                color[0] = {value: 300,
                    color: "#F7464A",
                    highlight: "#FF5A5E",
                    label: "Red"
                };
                color[1] =
                        {
                            value: 50,
                            color: "#46BFBD",
                            highlight: "#5AD3D1",
                            label: "Green"
                        };
                color[2] =
                        {
                            value: 100,
                            color: "#FDB45C",
                            highlight: "#FFC870",
                            label: "Yellow"
                        };
                color[3] =
                        {
                            value: 40,
                            color: "#949FB1",
                            highlight: "#A8B3C5",
                            label: "Grey"
                        };
                color[4] =
                        {
                            value: 120,
                            color: "#4D5360",
                            highlight: "#616774",
                            label: "Dark Grey"
                        };

                data.sort(function (a, b) {
                    if (a.numMessages < b.numMessages) {
                        return -1;
                    }
                    else if (a.numMessages > b.numMessages) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });



            })
            .catch(function (err) {
                reject(err);
            });
};
module.exports = {
    analyzeConversation: analyzeConversation
};


