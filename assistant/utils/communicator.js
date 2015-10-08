
var config = require("./../config.json");

var comm = require(config.clientCommunicationPath);

var logger = require(config.loggerPath);


/*
 * sendTextItem() sends a textItem to a circuit conversation
 * 
 * @param {text} convId    ID of the conversation
 * @param {text} text      text which will be sent
 */
var sendTextItem = function (convId, text, itemId) {
    logger.debug("communicator.sendTextItem( " + convId + " )");

    return Promise.resolve(comm.sendTextItem(convId, text, itemId));
};

/*
 * sendTextItemWithFiles() sends a text message and a number of attachments
 * 
 * @param {text} convId         ID of the converrsation
 * @param {text} text           message text
 * @param {text} filePaths      array of file paths for the attachements
 * @param {text} itemId         optional, used if a comment to itemId shall be done
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
 * @param {text} convId         ID of the conversation
 * @param {int} number          how many items shall be fetched
 * @return {Promise}            array of items. items are specified in the circuit API
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
 * @param {text} convId     ID of conversation
 * @return {Promise}        conversation object specified in the circuit API
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

/**
 * getConversationWithUserNames() fetches a conversation and adds the user names
 * to the participants array
 * 
 * @param {type} convId     conversation to get
 * @returns {Promise}       conversation Object, enhanced with names. See Circuit API for 
 *                          further description
 */
var getConversationWithUserNames = function (convId) {
    logger.debug("communicator.getConversationWithUserName( " + convId + " )");

    return new Promise(function (resolve, reject) {

        getConversation(convId)
                .then(function (conv) {
                    getUsersById(conv.participants)
                            .then(function (users) {
                                for (var i = 0; i < users.length; i++) {
                                    conv.participants[i] = {
                                        userId: users[i].userId,
                                        displayName: users[i].displayName
                                    };
                                }

                                resolve(conv);
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
 * getUsersById() fetches an array of users
 * 
 * @param {type} userIds    ID's of the users to fetch
 * @returns {Promise}       array of users. Further documentation in the
 *                          Circuit API
 */
var getUsersById = function (userIds) {
    logger.debug("communicator.getUsersById( " + JSON.stringify(userIds) + " )");

    return new Promise(function (resolve, reject) {
        comm.getUsersById(userIds)
                .then(function (users) {
                    logger.debug("Successfully received the users [" +
                            userIds.toString() + "]: ");
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
    getConversationWithUserNames: getConversationWithUserNames,
    getUsersById: getUsersById
};