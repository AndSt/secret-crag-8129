'use strict';

var config = require("./../../config.json");

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var logger = require(config.loggerPath);

var selectUserData = function (userId) {
    logger.debug("statistics.dbFunctions.selectUserData( " + userId + " )");

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

var selectConversationData = function (convId) {
    logger.debug("statistics.dbFunctions.selectConversationData( " + convId + " )");

    return new Promise(function (resolve, reject) {
        var query = "SELECT COUNT( * ) AS numItems, " +
                "GROUP_CONCAT(`text` SEPARATOR ' ') AS text " +
                "FROM  `Items` " +
                "WHERE `convId` = '" + convId + "' " +
                "GROUP BY `convId` ";
        logger.debug("[conversationStatistics] selectConversationDataQuery: " +
                query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error('[userStatistics] Error, while selecting the ' +
                        'conversation data: ' + err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};

var selectConversationDataOfUser = function (convId, userId) {
    logger.debug("statistics.dbFunctions.selectConversationDataOfUser( " +
            convId + ", " + userId + " )");

    return new Promise(function (resolve, reject) {
        var query = "SELECT COUNT( * ) AS numItems, " +
                "GROUP_CONCAT(`text` SEPARATOR ' ') AS text " +
                "FROM  `Items` " +
                "WHERE `convId` = '" + convId + "' " +
                "AND `creatorId` = '" + userId + "' " +
                "GROUP BY `convId` ";
        logger.debug("[conversationStatistics] selectConversationDataOfUserQuery: " +
                query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error('[userStatistics] Error, while selecting the ' +
                        'conversation data of user ' + userId + ': ' + err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};

var selectConversationPerUserData = function (convId) {
    logger.debug("statistics.dbFunctions.selectConversationPerUserData( " +
            convId + " )");

    return new Promise(function (resolve, reject) {
        var query = "SELECT `creatorId`, COUNT( * ) AS numItems, " +
                "GROUP_CONCAT(`text` SEPARATOR ' ') AS text " +
                "FROM  `Items` " +
                "WHERE `convId` = '" + convId + "' " +
                "GROUP BY `creatorId` ";
        logger.debug("[conversationStatistics] selectConversationPerUserData: " +
                query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error('[userStatistics] Error, while selecting the ' +
                        'conversation data per user of' + convId + ': ' + err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
    selectUserData: selectUserData,
    selectConversationData: selectConversationData,
    selectConversationDataOfUser: selectConversationDataOfUser,
    selectConversationPerUserData: selectConversationPerUserData
};
