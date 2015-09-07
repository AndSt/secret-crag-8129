var logger = require('./../utils/logger');
var comm = require('./communication');

var meetingReminder = require('./meetingReminder');



var registerEventListener = function (client) {

    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        logger.info('itemAdded ' + item.text.content);
        if (item.type === "TEXT"
                && item.creatorId !== client.loggedOnUser.userId)
        {
            checkItem(item.text.content, function (err, val) {
                // only send answer, if there's no error
                // error handling is done in checkItem()
                logger.info("checkItem was done");
                if (err === false) {
                    comm.sendTextItem(item.convId, val);
                }
            });
        }
    });
};


var checkItem = function (item, callback) {
    logger.info("Fehler0");
    var text = item.text.content;
    var partials = text.split("/");
    logger.info("Fehler1");
    switch (partials[1]) {
        case "addMeetingDate":
            meetingReminder.addMeeting(item, partials, function (err, val) {
                callback(err, val);
            });
            break;
        default:
            logger.info("Fehler3");
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