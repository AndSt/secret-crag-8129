'use strict';

var config = require("./../../config.json");

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var logger = require(config.loggerPath);


/**
 * selectMostActiveConversations() select all active conversations in the last
 * {{days}} days. If
 * 
 * @param {int} days    optional. if not given time is not checked
 * @returns {Promise}   array of objects with {convId, number of items}
 */
var selectMostActiveConversations = function (days) {
    logger.debug("textStatistics.dbFunctions.selectMostActiveConversations( " + days + " )");

    var query;
    if (days) {
        query = "SELECT `convId`, COUNT(*) AS `count` FROM `Items` " +
                "WHERE TIMESTAMP > SUBDATE(NOW(), INTERVAL " + days + " DAY) " +
                "GROUP BY `convId` ORDER BY `count` DESC";
    }
    else {
        query = "SELECT `convId`, COUNT( * ) AS `count` FROM `Items` " +
                "GROUP BY `convId` ORDER BY `count` DESC ";
    }
    logger.debug("[conversationStatistics] selectMostActiveConversationsQuery: " + query);

    return new Promise(function (resolve, reject) {

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error("[conversationStatistics]: Error, while selecting " +
                        "the most active conversations within the last " + days +
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
 * selectConversationData() select all messages of the conversation
 * 
 * @param {type} convId
 * @returns {Promise}   returns { numItems: 'number of items', 
 *                          text: 'concatenation of all text written in the conversation'}
 */
var selectConversationData = function (convId) {
    logger.debug("textStatistics.dbFunctions.selectConversationData( " + convId + " )");

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
                resolve(rows[0]);
            }
        });
    });
};


/**
 * 
 * @param {type} convId
 * @param {type} userId
 * @returns {Promise}
 */
var selectConversationDataOfUser = function (convId, userId) {
    logger.debug("textStatistics.dbFunctions.selectConversationDataOfUser( " +
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


/*
 * 
 */
var selectConversationPerUserData = function (convId, days) {
    logger.debug("textStatistics.dbFunctions.selectConversationPerUserData( " +
            convId + ",  " + days + " )");

    return new Promise(function (resolve, reject) {
        var query;
        if (days) {
            query = "SELECT `creatorId`, COUNT( * ) AS numItems, " +
                    "GROUP_CONCAT(`text` SEPARATOR ' ') AS text " +
                    "FROM  `Items` " +
                    "WHERE `convId` = '" + convId + "' " +
                    "AND  TIMESTAMP > SUBDATE(NOW(), INTERVAL " + days + " DAY) " +
                    "GROUP BY `creatorId` ";
        }
        else {
            query = "SELECT `creatorId`, COUNT( * ) AS numItems, " +
                    "GROUP_CONCAT(`text` SEPARATOR ' ') AS text " +
                    "FROM  `Items` " +
                    "WHERE `convId` = '" + convId + "' " +
                    "GROUP BY `creatorId` ";
        }
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
    selectMostActiveConversations: selectMostActiveConversations,
    selectConversationData: selectConversationData,
    selectConversationDataOfUser: selectConversationDataOfUser,
    selectConversationPerUserData: selectConversationPerUserData
};
