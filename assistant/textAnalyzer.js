var mysql = require('mysql');
var dbConn = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var circuitConn = require('./communication');

/*  
 * 
 */
var saveNewTextStatistics = function (convId, number) {

    var participants;

    return new Promise(function (resolve, reject) {
        circuitConn.getConversation(convId)
                .then(function (conv) {
                    participants = conv.participants;
                    return Promise.resolve();
                })
                .then(circuitConn.getLastItems(convId, number))
                .then(function (items) {
                    var stats = [];

                    participants.forEach(function (participant) {
                        stats[participants.indexOf(participant)] =
                                {
                                    userId: participant,
                                    numMessages: 0,
                                    numLetters: 0
                                };
                    });


                    var text, index;
                    items.forEach(function (item) {
                        if (item.type === "TEXT") {
                            index = participants.indexOf(item.creatorId);
                            stats[index].numMessages += 1;

                            text = item.text.content;
                            stats[index].numLetters += text.length;
                        }
                    });

                    logger.info("stats: " + JSON.stringify(stats));

//                    dbConn.query(
//                            "INSERT INTO `TextStatistics`(`convId`, `stats`) " +
//                            "VALUES ('" + convId + "', '" + JSON.stringify(stats) + "')",
//                            function (err) {
//                                if (err) {
//                                    logger.error("[textAnalyzer] Error while inserting " +
//                                            +"text statistics: " + err);
//                                    reject("Error while inserting text statistics. " +
//                                            "Please try again.");
//                                }
//                                else {
//                                    logger.info("[textAnalyzer] Inserting of " +
//                                            "text statistics " + "went well");
//                                    resolve(stats);
//                                }
//                            });
                    resolve(stats);
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};


var analyzeConversation = function (item, partials) {

    logger.info("Textanalyzer: started analyzeConversation");

    return new Promise(function (resolve, reject) {
        var number = typeof partials[2] === 'undefined' ? 1000 : partials[2];

        saveNewTextStatistics(item.convId, number)
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



var getTextStatistics = function (convId) {
    var stats;

    connection.query(
            "INSERT INTO `TextStatistics`(`convId`, `stats`) " +
            "VALUES ('" + convId + "', '" + JSON.stringify(stats) + "')",
            function (err, ret) {
                //TODO what is ret
            });
};


module.exports = {
    analyzeConversation: analyzeConversation
};


