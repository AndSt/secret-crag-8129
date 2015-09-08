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
            parseItem(item)
                    .then(function (text) {
                        comm.sendTextItem(item.convId, text);
                    })
                    .catch(function (err) {
                        logger.log("Parsing didn't work, because:" + err);
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
                resolve(meetingReminder.addMeeting(item, partials));
                break;
            case "getTextStatistics":
                resolve(textAnalyzer.analyzeConversation(item, partials));
            default:
                resolve("12345");
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