var logger = require('./../utils/logger');
var client = require('./../utils/client').getClient();

var sendTextItem = function (convId, text) {
    client.addTextItem(convId,
            {
                contentType: "RICH",
                content: text
            }
    ).then(function (ret) {
        logger.info("Antwort: " + ret);
    }).catch(function (err) {
        logger.error('Unable to answer. ' + err);
    });
};

module.exports = {
    sendTextItem: sendTextItem
};