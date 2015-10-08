'use strict';

var config = require("./../../config.json");

var logger = require(config.loggerPath);
var comm = require(config.root + "/utils/communicator");

var statsComputer = require("./statisticComputer");
var dbFunctions = require("./userDbFunctions");


/**
 * getMostActiveUsers() returns active users of the last {{days}} days
 * 
 * @param {type} days       optional. if not given, there is no time restriction
 * @returns {Promise}       return users given by the communicator
 */
var getMostActiveUsers = function (days) {
    logger.debug("userTextStatistics.getMostActiveUsers( " + days + " )");

    return new Promise(function (resolve, reject) {
        dbFunctions.selectMostActiveUsers(days)
                .then(function (rows) {

                    var userIds = rows.map(function (row) {
                        return row.creatorId;
                    });
                    comm.getUsersById(userIds)
                            .then(function (users) {
                                resolve(users);
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
 * getUserStatistics() returns statistics, like defined in main, about an user
 * 
 * @param {type} userId     id of the user
 * @returns {Promise}       statistics, or error string
 */
var getUserStatistics = function (userId) {
    logger.debug('userTextStatistics.getUserStatistics( ' + userId + " )");

    return new Promise(function (resolve, reject) {

        dbFunctions.selectUserData(userId).then(function (rows) {

            var text = "";
            var numItems = 0;

            rows.forEach(function (row) {
                numItems += parseInt(row.count);
                text = text + " " + row.text;
            });

            if (numItems <= 0) {
                return {
                    userId: userId,
                    numConvs: 0,
                    numItems: 0
                };
            }

            var stats = statsComputer.computeStats(text, numItems);

            stats.userId = userId;
            stats.numConvs = rows.length;
            stats.numItems = numItems;

            resolve(stats);
        }).catch(function (err) {
            reject(err);
        });

    });
};


module.exports = {
    getMostActiveUsers: getMostActiveUsers,
    getUserStatistics: getUserStatistics
};