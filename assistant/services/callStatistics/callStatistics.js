'use strict';


var config = require('./../../config.json');

var logger = require(config.loggerPath);

var eventDbFunctions = require("./dbFunctions/eventDbFunctions");
var bonusDbFunctions = require("./dbFunctions/bonusDbFunctions");
var bonusEngine = require("./bonusEngine");


var start = function (options) {
    logger.debug("callStatistics.start( " + options.convId + " )");


};



//////////////////////////////
//////////  EVENTS  //////////
//////////////////////////////

var conferenceStarted = function (options) {
    logger.debug("callStatistics.conferenceStarted( " + options.conferenceId + " )");

    return Promise.resolve(eventDbFunctions.insertCallEvent(options.convId, options.userId, options.conferenceId,
            "conferenceStarted", options.time, {}));
};


var conferenceEnded = function (options) {
    logger.debug("callStatistics.conferenceEnded( " + options.conferenceId + " )");

    return Promise.resolve(eventDbFunctions.insertCallEvent(options.convId, options.userId, options.conferenceId,
            "conferenceEnded", options.time, {}));
};


var userJoined = function (options) {
    logger.debug("callStatistics.userJoined( " + options.userId + " )");

    //add to db
    //compute bonus and add to db

    return new Promise(function (resolve, reject) {

        eventDbFunctions.insertCallEvent(options.convId, options.userId, options.conferenceId,
                "userJoined", options.time, {})
                .then(function () {
                    Promise.resolve(eventDbFunctions.selectNewestConverence(options.convId));
                })
                .then(function (rows) {
                    if (rows.length === 0) {
                        logger.error("[callStatistics] NO conference found");
                        reject("No conference found");
                    }
                    else {
                        var points = bonusEngine.computeTooLate(rows[0].time, options.joinTime);
                        resolve(bonusDbFunctions.insertPoints(options.convId, options.userId, options.conferenceId,
                                "tooLate", points));
                    }
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};

var userLeft = function (options) {
    logger.debug("callStatistics.userLeft( " + options.userId + " )");

    return Promise.resolve(eventDbFunctions.insertCallEvent(options.convId, options.userId, options.conferenceId,
            "userLeft", options.time, {}));
};

var userStartsSpeaking = function (options) {
    logger.debug("callStatistics.userStartsSpeaking()");

    return Promise.resolve(eventDbFunctions.insertCallEvent(options.convId, options.userId, options.conferenceId,
            "userStartsSpeaking", options.time, {}));
};

var userFinishedSpeaking = function (options) {
    logger.debug("callStatistics.userFinishedSpeaking()");

    return Promise.resolve(eventDbFunctions.insertCallEvent(options.convId, options.userId, options.conferenceId,
            "userFinishedSpeaking", options.time, {}));
};


///////////////////////////////
////////// Statistics /////////
///////////////////////////////

/**
 * getConversationSpeaktingTime() returns an array of speaking Times
 *  
 * @param {type} convId     the conversation, the statistics are made of
 * @returns {Promise}       return array users with 'user[uId]=speakingTime',
 *                          where uId is the ID of the user in the program
 */
var getConversationSpeakingTime = function (convId) {
    logger.debug("callStatistics.getSpeakingTime( " + convId + " )");

    return new Promise(function (resolve, reject) {

        eventDbFunctions.selectSpeakingTimes(convId)
                .then(function (rows) {
                    var users = {};

                    for (var i = 0; i < rows.length; i++) {
                        if (users.hasOwnProperty(rows[i].uId)) {
                            users[rows[i].uId] += rows[i].endTime - rows[i].startTime;
                        }
                        else {
                            users[rows[i].uId] = (rows[i].endTime - rows[i].startTime);
                        }
                    }

                    resolve(users);
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};


/**
 * 
 * 
 * @param {type} convId
 * @returns {Promise}
 */
var getConversationSpeakingTimePerConference = function (convId) {
    logger.debug("callStatistics.getConversationSpeakingTimePerConference");

    return new Promise(function (resolve, reject) {

        eventDbFunctions.selectSpeakingTimes(convId)
                .then(function (rows) {
                    var returnData = {};

                    for (var i = 0; i < rows.length; i++) {
                        if (returnData.hasOwnProperty(rows[i].cId)) {
                            if (returnData[rows[i].cId].hasOwnProperty(rows[i].uId)) {
                                returnData[rows[i].cId][rows[i].uId] += rows[i].endTime - rows[i].startTime;
                            }
                            else {
                                returnData[rows[i].cId][rows[i].uId] = rows[i].endTime - rows[i].startTime;
                            }
                        }
                        else {
                            returnData[rows[i].cId] = {};
                            returnData[rows[i].cId][rows[i].uId] = rows[i].endTime - rows[i].startTime;
                        }
                    }

                    resolve(returnData);
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};


var getTooLateInConversation = function (convId) {
    logger.debug("callStatistics.getTooLateInConversation(" + convId + ")");

    return new Promise(function (resolve, reject) {

    });
};


var getTooLateInConference = function (conferenceId) {
    logger.debug("callStatistics.getTooLateInConference(" + conferenceId + ")");

    return new Promise(function (resolve, reject) {

    });
};

var getConversationAverageSpeakingTime = function (convId) {
    logger.debug("callStatistics.getConversationAverageSpeakingTime( " + convId + " )");

    return new Promise(function (resolve, reject) {

        eventDbFunctions.selectSpeakingTimes(convId)
                .then(function (rows) {
                    var users = {};

                    for (var i = 0; i < rows.length; i++) {
                        if (users.hasOwnProperty(rows[i].uId)) {
                            users[rows[i].uId].numSpeaks += 1;
                            users[rows[i].uId].time += rows[i].endTime - rows[i].startTime;
                        }
                        else {
                            users[rows[i].uId] = {
                                numSpeaks: 1,
                                time: (rows[i].endTime - rows[i].startTime)
                            };
                        }
                    }

                    for(var user in users){
                        users[user].average = users[user].time / users[user].numSpeak;
                    }

                    resolve(users);
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};



var getConversationAverageSpeakingTimePerConference = function (convId) {
    logger.debug("callStatistics.getConversationAverageSpeakingTimePerConference(" + convId + ")");

    return new Promise(function (resolve, reject) {

        eventDbFunctions.selectSpeakingTimes(convId)
                .then(function (rows) {
                    var returnData = {};

                    for (var i = 0; i < rows.length; i++) {
                        if (returnData.hasOwnProperty(rows[i].cId)) {
                            if (returnData[rows[i].cId].hasOwnProperty(rows[i].uId)) {
                                returnData[rows[i].cId][rows[i].uId].numSpeaks += 1;
                                returnData[rows[i].cId][rows[i].uId].time += rows[i].endTime - rows[i].startTime;
                            }
                            else {
                                returnData[rows[i].cId][rows[i].uId] = {
                                    numSpeaks: 1,
                                    time: rows[i].endTime - rows[i].startTime
                                };
                            }
                        }
                        else {
                            returnData[rows[i].cId] = {};
                            returnData[rows[i].cId][rows[i].uId] = {
                                numSpeaks: 1,
                                time: rows[i].endTime - rows[i].startTime
                            };
                        }
                    }
                    
                    for(var conf in returnData){
                        for(var user in returnData[conf]){
                            returnData[conf][user].average = returnData[conf][user].time / returnData[conf][user].numSpeaks;
                        }
                    }

                    resolve(returnData);
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};



module.exports = {
    conferenceStarted: conferenceStarted,
    conferenceEnded: conferenceEnded,
    userJoined: userJoined,
    userLeft: userLeft,
    userStartsSpeaking: userStartsSpeaking,
    userFinishedSpeaking: userFinishedSpeaking,
    getConversationSpeakingTime: getConversationSpeakingTime,
    getConversationSpeakingTimePerConference: getConversationSpeakingTimePerConference
};
