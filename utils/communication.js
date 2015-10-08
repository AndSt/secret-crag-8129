

var circuit = require('circuit');
var File = require('file-api').File;

var logger = require('./logger');
var client = require('./client').getClient();

//var config = require('./../config/config.json');


/*
 * sendTextItem() sends a textItem to a circuit conversation
 * 
 * @param convId    ID of the conversation
 * @param text      text which will be sent
 * @param itemId    (optional) if a itemId is known, a comment to this
 *                  item shall be made
 */
var sendTextItem = function (convId, text, itemId) {
    logger.debug("sendTextItem( " + convId + " )");

    return new Promise(function (resolve, reject) {
        var options = {
            contentType: "RICH",
            content: text
        };

        if (itemId) {
            options.parentId = itemId;
        }
        client.addTextItem(convId, options)
                .then(function (item) {
                    resolve(item);
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};

/**
 * 
 * @param {type} convId
 * @param {type} text
 * @param {type} filePaths
 * @param {type} itemId
 * @returns {Promise}
 */
var sendTextItemWithFiles = function (convId, text, filePaths, itemId) {
    logger.debug("sendTextItemWithFiles( " + convId + " )");

    files = [];
    filePaths.forEach(function (filePath) {
        var file = new File(filePath);
        files.push(file);
    });

    var message = {
        content: text,
        attachments: files
    };
    if (itemId) {
        message.parentId = itemId;
    }

    return new Promise(function (resolve, reject) {

        client.addTextItem(convId, message)
                .then(function (item) {
                    logger.debug("Message '" + text + "' to conversation " +
                            convId + "was delivered correctly");
                    resolve();
                })
                .catch(function (err) {
                    logger.error('Unable to send text+file message to ' + convId +
                            ', because: ' + err);
                    reject(err);
                });

    });
};


/*
 * getLastTextItems() receives the last textItems of a conversation
 * 
 * @param convId            ID of the conversation
 * @param number            how many items shall be fetched
 * @return                  array of items. items are specified in the circuit API
 */
var getLastItems = function (convId, number) {
    return new Promise(function (resolve, reject) {
        client.getConversationItems(convId, {numberOfItems: number})
                .then(function (itemsData) {
                    logger.info("Successfully retrieved " + number + " items");
                    var items = itemsData.map(function (itemitem) {
                        return {
                            itemId: item.itemId,
                            convId: item.convId,
                            type: item.text.type,
                            text: item.text.content,
                            creatorId: item.creatorId,
                            creationTime: item.creationTime,
                            modificationTime: item.modificationTime
                        };
                    });
                    resolve(items);
                })
                .catch(function (err) {
                    logger.error("Failure while retrieving items: " + err);
                    reject("Failure while retrieving the items");
                });
    });
};

/*
 * getConversation() receives the details of a conversation
 * 
 * @param convId    ID of conversation
 * @return          conversation object specified in the circuit API
 */
var getConversation = function (convId) {
    return new Promise(function (resolve, reject) {
        client.getConversationById(convId)
                .then(function (conv) {
                    resolve(conv);
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};


var getUsersById = function (userIds) {
    return new Promise(function (resolve, reject) {
        client.getUsersById(userIds)
                .then(function (users) {
                    logger.info("Successfully received the users [" +
                            userIds.toString() + "]: " +
                            JSON.stringify(users));
                    resolve(users);
                })
                .catch(function (err) {
                    logger.error("Failure while retrieving the users [" +
                            userIds.toString() + "]");
                    reject(err);
                });
    });
};


module.exports = {
    sendTextItem: sendTextItem,
    sendTextItemWithFiles: sendTextItemWithFiles,
    getLastItems: getLastItems,
    getConversation: getConversation,
    getUsersById: getUsersById
};