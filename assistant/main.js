var logger = require('./../utils/logger');
var comm = require('./communication');

var meetingReminder = require('./meetingReminder');
var textAnalyzer = require('./textAnalyzer');
var optionParser = require('./optionParser');


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

        if (text.indexOf('meeting assistant')> -1) {
            logger.info('The user speaks with the meeting assistant');
            optionParser.checkOptions(text).then(function (options) {
                if (options.remindMeeting.isInUse === true) {
                    resolve(meetingReminder.addMeeting(item, options.remindMeeting));
                }
                else if (options.textAnalyzer.isInUse === true) {
                    resolve(textAnalyzer.analyzeConversation(item, options));
                }
                else {
                    resolve("12345");
                }
            });
        }
        else {
            reject("The assistent must not answer");
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