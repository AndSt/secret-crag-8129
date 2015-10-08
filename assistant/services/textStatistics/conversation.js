'use strict';

var config = require("./../../config.json");

var logger = require(config.loggerPath);
var comm = require(config.root + "/utils/communicator");

var statsComputer = require("./statisticComputer");
var dbFunctions = require("./conversationDbFunctions");


/**
 * getMostAct
 * 
 * @param {type} days
 * @returns {Promise}
 */
var getMostActiveConversations = function (days) {
    logger.debug("textStatistics.getMostActiveConversations( " + days + " )");

    return new Promise(function (resolve, reject) {
        
        dbFunctions.selectMostActiveConversations(days)
                .then(function (rows) {

                    var promises = [];
                    rows.forEach(function (row) {
                        promises.push(comm.getConversationWithUserNames(row.convId));
                    });

                    Promise.all(promises)
                            .then(function (dataArr) {
                                resolve(dataArr);
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


/**
 * 
 * @param {type} convId
 * @returns {Promise}
 */
var getConversationStatistics = function (convId) {
    logger.debug('textStatistics.getConversationStatistics( ' + convId + ' )');

    return new Promise(function (resolve, reject) {

        dbFunctions.selectConversationData(convId)
                .then(function (rows) {
                    var stats = computeStats(rows[0].text, rows[0].numItems);
                    stats.convId = convId;
                    stats.numItems = rows[0].numItems;

                    resolve(stats);
                }).catch(function (err) {
            reject(err);
        });
    });
};


/**
 * 
 * @param {type} convId
 * @param {type} userId
 * @returns {Promise}
 */
var getConversationStatisticsOfUser = function (convId, userId) {
    logger.debug("textStatistics.getConversationStatisticsOfUser( " + convId + ", " + userId + " )");

    return new Promise(function (resolve, reject) {

        dbFunctions.selectConversationDataOfUser(convId, userId)
                .then(function (rows) {
                    var stats = statsComputer.computeStats(rows[0].text, rows[0].numItems);

                    stats.convId = convId;
                    stats.numItems = rows[0].numItems;

                    resolve(stats);
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};


/**
 * 
 * @param {type} convId
 * @returns {Promise}
 */
var getConversationStatisticsPerUser = function (convId, days) {
    logger.debug("textStatistics.getConversationStatisticsPerUser( " + convId + " )");

    return new Promise(function (resolve, reject) {

        dbFunctions.selectConversationPerUserData(convId, days)
                .then(function (rows) {

                    var stats = {
                        convId: convId,
                        numUser: rows.length,
                        numItems: rows.reduce(function (oldVal, row) {
                            return oldVal + row.numItems;
                        }, 0),
                        user: [
                        ]
                    };

                    var userIds = [];
                    rows.forEach(function (row) {
                        userIds.push(row.creatorId);
                    });

                    comm.getUsersById(userIds)
                            .then(function (users) {
                                var usersIndex;
                                for (var i = 0; i < rows.length; i++) {
                                    stats.user.push(statsComputer.computeStats(rows[i].text, rows[i].numItems));
                                    stats.user[stats.user.length - 1].userId = rows[i].creatorId;
                                    stats.user[stats.user.length - 1].numItems = rows[i].numItems;
                                    usersIndex = users.map(function (user) {
                                        return user.userId;
                                    }).indexOf(rows[i].creatorId);
                                    stats.user[stats.user.length - 1].displayName = users[usersIndex].displayName;
                                }
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



module.exports = {
    getMostActiveConversations: getMostActiveConversations,
    getConversationStatistics: getConversationStatistics,
    getConversationStatisticsOfUser: getConversationStatisticsOfUser,
    getConversationStatisticsPerUser: getConversationStatisticsPerUser
};