'use strict';

var config = require("./../../config.json");

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var logger = require(config.loggerPath);



/**
 * selectMostActiveUsers() selects all active users in the last {{days}} days
 * 
 * @param {type} days   optional. if not given, time is not restricted
 * @returns {Promise}   array of objects: { creatorId: 'creatorId', 
 *                                          count: 'number of items written'}
 */
var selectMostActiveUsers = function (days) {
    logger.debug("textStatistics.dbFunctions.selectMostActiveUsers");

    var query;
    if (days) {
        query = "SELECT `creatorId`, COUNT(*) AS `count` FROM `Items` " +
                "WHERE TIMESTAMP > SUBDATE(NOW(),'" + days + "') " +
                "GROUP BY `creatorId` ORDER BY `count` DESC";
    }
    else {
        query = "SELECT `creatorId`, COUNT( * ) AS `count` FROM `Items` " +
                "GROUP BY `creatorId` ORDER BY `count` DESC";
    }
    logger.debug("[conversationStatistics] selectMostActiveUsersQuery: " + query);

    return new Promise(function (resolve, reject) {

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error("[conversationStatistics]: Error, while selecting " +
                        "the most active users within the last " + days +
                        "days: " + err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};



/**
 * selectUserData() returns an array of data about the user
 * 
 * @param {type} userId     the selected user
 * @returns {Promise}       returns an array of obects of the form
 *                          { convId: 'convId', count: 'number of messages written in this conversation',
 *                          text: 'concatenation of all text messages in this conversation'}
 */
var selectUserData = function (userId) {
    logger.debug("textStatistics.dbFunctions.selectUserData( " + userId + " )");

    var query = "SELECT `convId`, COUNT(*) as count, " +
            "GROUP_CONCAT(`text`) AS text " +
            "FROM `Items` " +
            "WHERE `creatorId`='" + userId + "' " +
            "GROUP BY `convId`";
    logger.debug("[userStatistics] selectUserDataQuery: " + query);

    return new Promise(function (resolve, reject) {

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error('[userStatistics] Error, while selecting the user data: ' + err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};


module.exports = {
    selectMostActiveUsers: selectMostActiveUsers,
    selectUserData: selectUserData
};