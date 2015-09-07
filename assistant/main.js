var logger = require('./../utils/logger');
var meetingReminder = require('./meetingReminder');



var registerEventListener = function (client) {

    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        logger.info('itemAdded ' + item.text.content);
        if (item.type === "TEXT")
        {
            checkItem(item.text.content, function (err, val) {
                if ('val' !== '12345') {
                    client.addTextItem(item.convId,
                            {
                                contentType: "RICH",
                                content: val
                            }
                    ).then(function (ret) {
                        logger.info("Antwort: " + ret);
                    }).catch(function (err) {
                        logger.error('Unable to answer. ' + err);
                    });
                }
            });
        }
    });
};
var checkItem = function (text, callback) {
    var partials = text.split("/");
    switch (partials[1]) {
        case "addMeetingDate":
            meetingReminder.addMeeting(text, partials, function (err, val) {
                if (err) {
                    callback(err, val);
                }
                else {
                    callback(err, val);
                }
            });
            break;
        default:
            callback(true, "12345");
    }
};
var update = function () {
    meetingReminder.update();
};
module.exports = {
    registerEventListener: registerEventListener,
    checkItem: checkItem,
    update: update
};