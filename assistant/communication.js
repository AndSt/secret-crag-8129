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
 * convId:  ID of the conversation
 * number:  how many items shall be fetched
 */
var getLastTextItems = function(convId, number, callback){
    
};

module.exports = {
    sendTextItem: sendTextItem
};