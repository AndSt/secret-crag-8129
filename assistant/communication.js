var circuit = require('circuit');
var logger = require('./../utils/logger');
var client = require('./../utils/client').getClient();



/*
 * sendTextItem() sends a textItem to a circuit conversation
 * 
 * @param convId    ID of the conversation
 * @param text      text which will be sent
 */
var sendTextItem = function (convId, text) {
    client.addTextItem(convId,
            {
                contentType: "RICH",
                content: text
            }
    ).then(function (item) {
        logger.info("Message to conversation " + convId + "was delivered " +
                "correctly");
    }).catch(function (err) {
        logger.error('Unable to answer. ' + err);
    });
};

/*
 * getLastTextItems receives the last textItems of a conversation
 * 
 * @param convId            ID of the conversation
 * @param number            how many items shall be fetched
 * @param callback(err, b)  will be called with
 *            err - true, if retrieving of the items fails
 *            b - items, if err=true, error string otherwise
 */
var getLastItems = function (convId, number) {
    return new Promise(function (resolve, reject) {
        client.getConversationItems(convId, {numberOfItems: number})
                .then(function (items) {
                    logger.info("Successfully retrieved " + number + " items: " +
                            JSON.stringify(items));
                    resolve(items);
                }, function (err) {
                    logger.error("Failure while retrieving items: " + err);
                    reject("Failure while retrieving the items");
                });
    });
};

/*
 * 
 */
var getConversation = function (convId) {
    return new Promise(function (resolve, reject) {
        client.getConversationById(convId)
                .then(function (conv) {
                    logger.info("Successfully retrieved the conversation " +
                            convId + ": " + JSON.stringify(conv));
                    resolve(conv);
                })
                .catch(function (err) {
                    logger.error("Failure while retrieving the conversation " +
                            convId);
                    reject(err);
                });
    });
};

module.exports = {
    sendTextItem: sendTextItem,
    getLastItems: getLastItems,
    getConversation: getConversation
};