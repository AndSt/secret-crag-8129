var circuit = require('circuit');
var logger = require('./../utils/logger');
var client = require('./../utils/client').getClient();


/*
 * sendTextItem() sends a textItem to a circuit conversation
 * 
 * convId:  ID of the conversation
 * text:    text which will be sent
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
 * convId:      ID of the conversation
 * number:      how many items shall be fetched
 * callback:    gets an array of items(like in the circuit JS SDK)
 */
var getLastItems = function (convId, number, callback) {
    client.getConversationItems(convId, {numberOfItems: number})
            .then(function (items) {
                logger.info("Successfully retrieved " + number + "items: " +
                        JSON.stringify(items));
                callback(false, items);
            }, function (err) {
                logger.error("Failure while retrieving items: " + err);
                callback(true, "Failure while retrieving the items");
            });
};

var getConversation = function (convId, callback) {
    client.getConversationById(convId)
            .then(function (conv) {
                callback(false, conv);
            }, function (err) {
                logger.error("Failure while retrieving the conversation " +
                        convId);
                callback(true, "Failure while retrieving the conversation" +
                        convId);
            });
};

module.exports = {
    sendTextItem: sendTextItem,
    getLastItems: getLastItems,
    getConversation: getConversation
};