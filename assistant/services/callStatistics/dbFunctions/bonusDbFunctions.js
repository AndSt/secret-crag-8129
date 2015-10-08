'use strict';

var config = require("./../../../config.json");

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var logger = require(config.loggerPath);

var bonusSystem = require(config.root + "/files/bonusSystem.json");


var insertPoints = function (convId, userId, conferenceId, type, points, options) {
    logger.debug("callStatistics.bonusDbFunctions.insertPoints( " + points + " )");

    return new Promise(function (resolve, reject) {

        var query = "INSERT INTO `points` (`convId`, `userId`, `conferenceId`, " +
                "`type`, `points`, `options`) " +
                "VALUES ('" + convId + "', '" + userId + "', '" + conferenceId + "', " +
                "'" + type + "', '" + points + "', '" + options + "')";
        logger.debug("[callStatistics] insertPointsQuery: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error("[callStatistics] Error, while inserting points: " + err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};

var getTooLateInConference = function(convId){
    
    return new Promise(function(resolve, reject){
        
        var query = "SELECT * ";
    });
}

module.exports = {
    insertPoints: insertPoints
};