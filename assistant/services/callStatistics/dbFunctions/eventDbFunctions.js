'use strict';

var config = require("./../../../config.json");

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var logger = require(config.loggerPath);

var bonusSystem = require(config.root + "/files/bonusSystem.json");



var insertCallEvent = function (convId, userId, conferenceId, type, time, options) {
    logger.debug("callStatistics.insertCallEvent( " + type + " )");

    return new Promise(function (resolve, reject) {

        var query = "INSERT INTO `callEvents` (`convId`, `conferenceId`, " +
                "`userId`, `time`, `options`, `type`) " +
                "VALUES ( '" + convId + "', '" + conferenceId + "', " +
                "'" + userId + "', '" + time + "', " +
                "'" + JSON.stringify(options) + "', '" + type + "')";
        logger.debug("[callStatistics]: insertCallEventQuery: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error("[callStatistics]: Error, while inserting a " +
                        "new call event:  " + err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};


var selectNewestConference = function (convId) {
    logger.debug("callStatistics.eventDbFunctions.selectNewestConference( " + convId + " )");

    return new Promise(function (resolve, reject) {

        var query = "SELECT * FROM `callEvents` " +
                "WHERE `convId` = '" + convId + "' AND `type` = 'conferenceStarted' AND " +
                "`time` >= (SELECT MAX(`time`) FROM `callEvents` " +
                "WHERE `convId` = '" + convId + "' AND `type` = 'conferenceStarted')";
        logger.debug("[callStatistics] selectNewestConferenceQuery: " + query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error("[callStatistics] Error, while selecting the newest " +
                        "conference: " + err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};


var selectSpeakingTimes = function (convId) {
    logger.debug("callStatistics.eventDbFunctions.selectSpeakingTimes( " + convId + " )");
    //selects all speaking times in the form {userI, confId, startTime, endTime}

    var query = "SELECT a.userId as uId, a.conferenceId as cId, a.time as startTime, b.time as endTime FROM (SELECT userId, conferenceId, time FROM callEvents WHERE type='userStartsSpeaking') as a JOIN (SELECT userId, conferenceId, time FROM callEvents WHERE type='userFinishedSpeaking' ORDER BY time ASC) as b ON a.userId=b.userId AND a.conferenceId=b.conferenceId WHERE b.time>a.time GROUP BY startTime;";
    logger.debug("[callStatistics] eventDbFunctions.selectSpeakingTimesQuery: " + query);

    return new Promise(function (resolve, reject) {

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error("[callStatistics] Error, while selecting the " +
                        "the speaking times: " + err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};


module.exports = {
    insertCallEvent: insertCallEvent,
    selectNewestConference: selectNewestConference,
    selectSpeakingTimes: selectSpeakingTimes
};