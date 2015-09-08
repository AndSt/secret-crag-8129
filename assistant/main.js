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
                // error handling is done in parseItem()
                if (err === false) {
                    comm.sendTextItem(item.convId, val);
                }
            });
        }
    });
};


var parseItem = function (item, callback) {
    return new Promise(function (resolve, reject) {

        var text = item.text.content;
        var partials = text.split("/");
        switch (partials[1]) {
            case "addMeetingDate":
                meetingReminder.addMeeting(item, partials)
                        .then(function (val) {
                            callback(false, val);
                        })
                        .catch(function (err) {
                            callback(false, err);
                        });
                break;
            case "getTextStatistics":
                textAnalyzer.analyzeConversation(item, partials)
                        .then(function (val) {
                            callback(false, val);
                        })
                        .catch(function (err) {
                            callback(false, err);
                        });
            default:
                callback(true, "12345");
        }

    });
};
var update = function () {
    meetingReminder.update();
};
module.exports = {
    registerEventListener: registerEventListener,
    parseItem: parseItem,
    update: update
};