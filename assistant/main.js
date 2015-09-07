var logger = require('./../utils/logger');
var comm = require('./communication');

var meetingReminder = require('./meetingReminder');
var textAnalyzer = require('./textAnalyzer');



var registerEventListener = function (client) {

    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        logger.info('itemAdded ' + item.text.content);
        if (item.type === "TEXT"
                && item.creatorId !== client.loggedOnUser.userId)
        {
            parseItem(item, function (err, val) {
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


var parseItem = function (item, callback) {
    var text = item.text.content;
    var partials = text.split("/");
    switch (partials[1]) {
        case "addMeetingDate":
            meetingReminder.addMeeting(item, partials, function (err, val) {
                callback(err, val);
            });
            break;
        case "getTextStatistics":
            textAnalyzer.analyzeTextItems(item, partials, function (err, val) {
                callback(err, val);
            });
        default:
            callback(true, "12345");
    }
};
var update = function () {
    meetingReminder.update();
};
module.exports = {
    registerEventListener: registerEventListener,
    parseItem: parseItem,
    update: update
};