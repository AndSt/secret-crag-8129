var mysql = require('mysql');
var dbConn = require('./../../utils/database').getConnection();
var logger = require('./../../utils/logger');

var textStats = require('text-statistics');


var getUserStatistics = function (userId) {
    logger.debug('getUserStatistics( ' + userId + " )");

    return new Promise(function (resolve, reject) {

        var query = "SELECT `convId`, COUNT(*) as count, " +
                "GROUP_CONCAT(`text`) AS text " +
                "FROM `Items` " +
                "WHERE `creatorId`='3a8e9bb5-7a1f-4582-a651-fce583725063' " +
                "GROUP BY `convId`";

        logger.debug("[userStatistics] getUserStatisticsQuery: " + query);

        dbConn.query(query, function (err, rows, fields) {
            if (err) {
                logger.error('getUserStatistics(): ' + err);
                reject(err);
            }

            logger.info("[userStatistics] Successfully received data from " +
                    "database: " + JSON.stringify(rows) + ":" + JSON.stringify(fields));
            logger.info("hier");
            logger.info(rows.length);
            var text = "";
            var numItems = 0;
            rows.forEach(function (row) {
                logger.info("läuft");
                numItems += parseInt(row.count);
                text = text + " " + row.text;
            });

            logger.info(numItems);
            logger.info(text);

            resolve("läuft");

            if (numItems <= 0) {
                reject('No rows got found');
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