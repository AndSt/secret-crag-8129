var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var circuitConn = require('./communication');

/*  
 * 
 */
var getTextItemNumbers = function (convId, number) {

    return new Promise(function (resolve, reject) {

        circuitConn.getConversation(convId)
                .then(function (conv) {

                    circuitConn.getLastItems(convId, number)
                            .then(function (items) {
                                var participants = conv.participants;
                                var stats = [];

                                participants.forEach(function (participant) {
                                    stats[participants.indexOf(participant)] =
                                            {
                                                userId: participant,
                                                numMessages: 0,
                                                numLetters: 0
                                            };
                                });

                                var text;
                                items.forEach(function (item) {
                                    if (item.type === "TEXT") {
                                        stats[item.creatorId].numMessages += 1;
                                        text = item.text.content;
                                        stats[item.creatorId].numLetters += text.length;
                                    }
                                });

                                var logText = "";
                                for (i = 0; i < participants.length; i++) {
                                    logText = logText + JSON.stringify(stats[i]);
                                }

                                logger.info("Statistiken für " + items.length +
                                        "Items: " + ",!!! " + logText
                                        + " und " + stats.toString());
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

    logger.info("Textanalyzer: started analyzeConversation");

    return new Promise(function (resolve, reject) {
        var number = typeof partials[2] === 'undefined' ? 100 : partials[2];

        getTextItemNumbers(item.convId, number)
                .then(function (data) {

                    var outputData = [];
                    outputData[0] = {value: 300,
                        color: "#F7464A",
                        highlight: "#FF5A5E",
                        label: "Red"
                    };
                    outputData[1] =
                            {
                                value: 0,
                                color: "#46BFBD",
                                highlight: "#5AD3D1",
                                label: "Green"
                            };
                    outputData[2] =
                            {
                                value: 0,
                                color: "#FDB45C",
                                highlight: "#FFC870",
                                label: "Yellow"
                            };
                    outputData[3] =
                            {
                                value: 0,
                                color: "#949FB1",
                                highlight: "#A8B3C5",
                                label: "Grey"
                            };
                    outputData[4] =
                            {
                                value: 0,
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

                    var i = 0;
                    while (i < data.length && i <= 4) {
                        outputData[i].value = data[i].numMessages;
                        outputData[i].label = data[i].userId;
                        i++;
                    }
                    logger.log(JSON.stringify(outputData));
                    resolve("läuft gut");
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};


module.exports = {
    analyzeConversation: analyzeConversation
};


