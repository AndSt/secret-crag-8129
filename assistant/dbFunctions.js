

var mysql = require('mysql');
var dbConn = require('./../../utils/database').getConnection();
var logger = require('./../../utils/logger');
var time = require('./../../utils/time');


var insertItemIntoDatabase = function (item) {
    logger.debug("main.dbFunctions.insertItemIntoDatabase()");

    return new Promise(function (resolve, reject) {

        var query = "INSERT INTO \`Items\`(\`itemId\`, \`convId\`, \`creatorId\`, " +
                " \`text\`) VALUES (\'" + item.itemId + "\', \'" + item.convId +
                "\', \'" + item.creatorId + "\', \'" + item.text.content + "\')";

        logger.debug("insertItemIntoDatabaseQuery: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error("[main]Adding a text item to the database " +
                        "failed ,because:" + err);
                reject("Adding a text item to the database failed");
            }
            else {
                logger.debug("[main]Successfully added a text item to database.");
                resolve();
            }
        });
    });
};

var selectConversationStatus = function (item) {
    logger.debug("main.dbFunctions.selectConversationStatus()");

    return new Promise(function (resolve, reject) {
        var query = "SELECT * FROM \`ConversationStatus\` " +
                "WHERE \`convId\`=\'" + item.convId + "\' " +
                "AND \`active\`=\'1\'";
        logger.debug("[main] checkConversationStatusQuery: " + query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error("[main] Error while selecting " +
                        "ConversationStatus: " + err);
                reject("Error while selecting ConversationStatus");
            }
            logger.debug("[main] Successfully selected ConversationStatus");
            resolve(rows);
        });
    });
};

module.exports = {
    insertItemIntoDatabase: insertItemIntoDatabase
};