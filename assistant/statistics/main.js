var mysql = require('mysql');
var dbConn = require('./../../utils/database').getConnection();
var logger = require('./../../utils/logger');

var textStats = require('text-statistics');


var getUserStatistics = function (userId) {
    logger.debug('getUserStatistics( ' + userId + " )");

    return new Promise(function (resolve, reject) {

        var query = "SELECT COUNT(*) as count, " +
                "GROUP_CONCAT(`text` SEPARATOR ' ') " +
                "FROM `Items` " +
                "WHERE `creatorId`='" + userId + "' GROUP BY `convId`";
        logger.debug("[Statistics] getUserStatisticsQuery: " + query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error('getUserStatistics(): ' + err);
                reject(err);
            }

            logger.info("[userStatistics] Successfully received data from " +
                    "database.");
            if (rows.length === 0) {
                reject('No rows found');
            }
            var text = rows[0].text;

            var numItems = 0;
            var i = 0;
            for (i = 0; i < rows.length; i++) {
                numItems += rows[i].count;
            }

            var stats = {
                userId: userId,
                numConvs: rows.length,
                numItems: numItems,
                letterCount: textStats.letterCount(text),
                wordCount: textStats.wordCount(text),
                sentenceCount: textStats.sentenceCount(text),
                commaCount: text.split(',').length - 1,
                questionCount: text.split('?').length - 1,
                exclaCount: text.split('!').length - 1
            };

            resolve(stats);
        });
    });
};

module.exports = {
    getUserStatistics: getUserStatistics
};