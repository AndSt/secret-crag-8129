
var config = require("./../config.json");

var comm = require(config.clientCommunicationPath);

var logger = require(config.loggerPath);


/*
 * sendTextItem() sends a textItem to a circuit conversation
 * 
 * @param convId    ID of the conversation
 * @param text      text which will be sent
 */
var sendTextItem = function (convId, text, itemId) {
    logger.debug("communicator.sendTextItem( " + convId + " )");

    return Promise.resolve(comm.sendTextItem(convId, text, itemId));
};

/*
 * 
 * @param {text} convId
 * @param {type} text
 * @param {type} filePaths
 * @param {type} itemId
 * @returns {Promise}
 */

var sendTextItemWithFiles = function (convId, text, filePaths, itemId) {
    logger.debug("communicator.sendTextItemWithFiles( " + convId + " )");

    return new Promise(function (resolve, reject) {
        resolve(comm.sendTextItemWithFiles(convId, text, filePaths, itemId));
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
    logger.debug("communicator.getLastItems( " + convId + " )");

    return new Promise(function (resolve, reject) {
        comm.getLastItems(convId, number)
                .then(function (items) {
                    logger.debug("Successfully retrieved " + number + " items");
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
    logger.debug("communicator.getConversation(" + convId + " )");

    return new Promise(function (resolve, reject) {
        comm.getConversation(convId)
                .then(function (conv) {
                    logger.debug("Successfully received the conversation " +
                            convId);
                    resolve(conv);
                })
                .catch(function (err) {
                    logger.error("Failure while received the conversation " +
                            convId);
                    reject(err);
                });
    });
};



var getUsersById = function (userIds) {
    logger.debug("communicator.getUsersById( " + JSON.stringify(userIds) + " )");

    return new Promise(function (resolve, reject) {
        comm.getUsersById(userIds)
                .then(function (users) {
                    logger.debug("Successfully received the users [" +
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

//var getLikes = function(convId){
//    return new Promise(function(resolve, reject){
//        client.
//    })
//}

module.exports = {
    sendTextItem: sendTextItem,
    sendTextItemWithFiles: sendTextItemWithFiles,
    getLastItems: getLastItems,
    getConversation: getConversation,
    getUsersById: getUsersById
};