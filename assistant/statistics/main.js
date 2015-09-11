var mysql = require('mysql');
var dbConn = require('./../../utils/database').getConnection();
var logger = require('./../../utils/logger');

var textStats = require('text-statistics');


var getUserStatistics = function (userId) {
    logger.debug('getUserStatistics( ' + userId + " )");

    return new Promise(function (resolve, reject) {

        var query = "SELECT COUNT(*) as count, " +
                "GROUP_CONCAT(`text` SEPARATOR ' ') AS text" +
                "FROM `Items` " +
                "WHERE `creatorId`='" + userId + "' GROUP BY `convId`";
        logger.debug("[userStatistics] getUserStatisticsQuery: " + query);
        
        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error('getUserStatistics(): ' + err);
                reject(err);
            }

            logger.info("[userStatistics] Successfully received data from " +
                    "database: " + JSON.stringify(rows));
            var text = "";

            var numItems = 0;
            rows.forEach(function (row) {
                logger.info("läuft");
                numItems += parseInt(row.count);
                text = text + " " + row.text;
            });
            
            logger.info(numItems);
            logger.info(text);

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