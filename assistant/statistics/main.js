var mysql = require('mysql');
var dbConn = require('./../../utils/database').getConnection();
var logger = require('./../../utils/logger');



var getUserStatistics = function (userId) {
    logger.debug('getUserStatistics( ' + userId + " )");

    var query = "SELECT `convId`, COUNT(*) as count, " +
            "GROUP_CONCAT(`text`) AS text " +
            "FROM `Items` " +
            "WHERE `creatorId`='3a8e9bb5-7a1f-4582-a651-fce583725063' " +
            "GROUP BY `convId`";

    logger.debug("[userStatistics] getUserStatisticsQuery: " + query);

    return new Promise(function (resolve, reject) {

        dbConn.query(query, function (err, rows, fields) {
            if (err) {
                logger.error('getUserStatistics(): ' + err);
                reject(err);
            }

            logger.info("[userStatistics] Successfully received data from " +
                    "database " + JSON.stringify(rows));
            var text = "";
            var numItems = 0;

            rows.forEach(function (row) {
                numItems += parseInt(row.count);
                text = text + " " + row.text;
            });

            var letterCount = 0;
            var tmp = text.split(' ');
            tmp.forEach(function (word) {
                letterCount += word.length;
            });

            if (numItems <= 0) {
                reject('No rows got found');
            }

            var stats = {
                userId: userId,
                numConvs: rows.length,
                numItems: numItems,
                letterCount: letterCount,
                wordCount: text.split(' ').length - (1 + numItems),
                sentenceCount: text.split('.').length - 1,
                commaCount: text.split(',').length - 1,
                questionCount: text.split('?').length - 1,
                exclaCount: text.split('!').length - 1
            };

            resolve(stats);
        });
    });
};

var getConversationStatistics = function (convId) {
    logger.debug('getConversationStatistics( ' + convId + ' )');

    return new Promise(function (resolve, reject) {
        var query = "SELECT COUNT( * ) AS numItems, " +
                "GROUP_CONCAT(`text` SEPARATOR ' ') AS text " +
                "FROM  `Items` " +
                "WHERE `convId` = '0a19d4c4-9819-40c0-a299-ee3ce8ccb8b5' " +
                "GROUP BY `convId` ";
        logger.debug("[conversationStatistics] getConversationStatisticsQuery: " +
                query);

        dbConn.query(query, function (err, rows, fields) {
            if (err) {
                reject(err);
            }

            var text = rows[0].text;

            var letterCount = 0;
            var tmp = text.split(' ');
            tmp.forEach(function (word) {
                letterCount += word.length;
            });

            var stats = {
                convId: convId,
                numItems: rows[0].numItems,
                letterCount: letterCount,
                wordCount: text.split(' ').length - (1 + numItems),
                sentenceCount: text.split('.').length - 1,
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