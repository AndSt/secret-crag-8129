'use strict';

var config = require("./../../config.json");

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var logger = require(config.loggerPath);
var time = require(config.root + '/utils/time');

var helper = require("./helper");


var parse = function (text) {
    logger.info("optionParser.testMeetingReminder( " + text + " )");

    var meetingReminder = meetingReminder = {
        isInUse: false,
        writtenOptionsWrong: false
    };

    var meetingReminderParsingOpts = parsingOptions.services.meetingReminder;
    if (helper.textContains(text, meetingReminderParsingOpts.keywords)) {
        logger.debug("meetingReminder functionality shall be used");

        meetingReminder.isInUse = true;
        logger.debug("meetingReminder is in use");

        var listKeywords = meetingReminderParsingOpts.options.list.keywords;
        var deleteKeywords = meetingReminderParsingOpts.options.delete.keywords;

        if (helper.textContains(text, listKeywords)) {
            meetingReminder.list = {isInUse: true};
        }


        // if no service of the meeting reminder is used, the standard service
        // add meeting shall be used
        var numServices = 0;
        var services = ['list', 'delete'];
        services.forEach(function (service) {
            if (meetingReminder.hasOwnProperty(service)) {
                if (meetingReminder[service].isInUse === true) {
                    numServices++;
                }
            }
        });
        if (numServices === 0) {
            var addMeeting = parseAddMeeting(text);
            if (addMeeting.isInUse === true) {
                meetingReminder.addMeeting = addMeeting;
            }
            else if (addMeeting.writtenOptionsWrong) {
                meetingReminder.isInUse = false;
                meetingReminder.writtenOptionsWrong = true;
                meetingReminder.addMeeting = addMeeting;
            }
            else {
                meetingReminder.isInUse = false;
            }
        }
    }

    return meetingReminder;
};

var parseAddMeeting = function (text) {
    logger.debug("optionParser.parseAddMeeting");

    var addMeeting = {
        isInUse: false
    };
    var addMeetingParsingOpts = parsingOptions.services.meetingReminder.options.addMeeting;

    var date = time.searchDate(text);
    if (date === false) {
        addMeeting.writtenOptionsWrong = true;
        addMeeting.sorryText = "No valid date/time could be found";

        logger.info("meetingReminder shall be used, but no" +
                "correct time format was found");
    }
    else {
        addMeeting.isInUse = true;
        addMeeting.date = date;
        addMeeting.remindEarlier = 300;

        //check if a ICS calendar event should be sent
        var icsKeywords = addMeetingParsingOpts.ics.keywords;
        if (helper.textContains(text, icsKeywords)) {
            addMeeting.ics = true;
        }
    }

    return addMeeting;
};

var validate = function (meetingReminderOptions) {
    logger.debug("optionParser.meetingReminder.validate()");
    var numServices = 0;
    var services = ['addMeeting', 'list', 'delete'];
    services.forEach(function (service) {
        if (meetingReminderOptions.hasOwnProperty(service)) {
            if (meetingReminderOptions[service].isInUse === true) {
                numServices++;
            }
        }
    });
    if (numServices === 1) {
        return true;
    }
    if (numServices > 1) {
        return {error: "meetingReminderTooMuchServices"};
    }

    return {error: "fatal error"};
};
module.exports = {
    parse: parse,
    parseAddMeeting: parseAddMeeting,
    validate: validate
};