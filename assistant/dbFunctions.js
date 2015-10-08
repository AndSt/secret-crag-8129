
var config = require("./config.json");

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var logger = require(config.loggerPath);
var time = require(config.root + '/utils/time');


var selectItem = function(itemId){
    logger.debug("main.dbFunctions.selectItem( " + itemId + " )");
    
    return new Promise(function(resolve, reject){
        
        var query = "SELECT * FROM `Items` " +
                "WHERE `itemId` = '"+ itemId + "'";
        logger.debug("[main] selectItemQuery: " + query);
        
        dbConn.query(query, function(err, rows){
            if(err){
                logger.error("[main]: Error, while selecting item: " + err);
                reject(err);
            }
            else {
                resolve(rows);
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
    selectItem: selectItem,
    selectConversationStatus: selectConversationStatus
};