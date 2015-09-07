var circuit = require('circuit');
var logger = require('./../utils/logger');
var client = require('./../utils/client').getClient();

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

module.exports = {
    sendTextItem: sendTextItem
};