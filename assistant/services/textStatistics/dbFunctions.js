'use strict';

var config = require("./../../config.json");

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var logger = require(config.loggerPath);


var insertTextItemIntoDatabase = function (item) {
    logger.debug("textStatistics.dbFunctions.insertTextItemIntoDatabase()");

    return new Promise(function (resolve, reject) {

        var query = "INSERT INTO \`Items\`(\`itemId\`, \`convId\`, \`creatorId\`, " +
                " \`text\`) VALUES (\'" + item.itemId + "\', \'" + item.convId +
                "\', \'" + item.creatorId + "\', \'" + item.text + "\')";

        logger.debug("[textStatistics] insertItemIntoDatabaseQuery: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error("[textStatistics]Adding a text item to the database " +
                        "failed ,because:" + err);
                reject("Adding a text item to the database failed");
            }
            else {
                resolve();
            }
        });
    });
};


var updateTextItem = function(item){
    logger.debug("textStatistics.dbFunctions.updateItem(" + item.itemId + ")");
    
    return new Promise(function(resolve, reject){
        
        var query = "UPDATE `Items` " +
                "SET `text` = '" + item.text + "' " +
                "WHERE itemId = '" + item.itemId + "'";
        logger.debug("[textStatistics] updateItemQuery: " + query);
        
        dbConn.query(query, function(err){
            if(err){
                logger.error("[textStatistics] Error, while updating item: " + err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};



module.exports = {
    insertTextItemIntoDatabase: insertTextItemIntoDatabase,
    updateTextItem: updateTextItem
};
