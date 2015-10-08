'use strict';

var config = require("./../../config.json");

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var logger = require(config.loggerPath);
var time = require(config.root + '/utils/time');
var helper = require(config.root + "/utils/stringHelper");


var parse = function (text) {
    logger.debug("optionParser.testMeetingReminder( " + text + " )");

    var meetingReminder = meetingReminder = {
        isInUse: false,
        writtenOptionsWrong: false
    };

    var meetingReminderParsingOpts = parsingOptions.services.meetingReminder;
    if (helper.textContains(text, meetingReminderParsingOpts.keywords)) {
        logger.debug("meetingReminder functionality shall be used");

        meetingReminder.isInUse = true;
        logger.debug("meetingReminder is in use");
        //only use standard, if no other sercive is found
        var useStandardFunctionality = true;

        var listKeywords = meetingReminderParsingOpts.options.list.keywords;
        var deleteKeywords = meetingReminderParsingOpts.options.delete.keywords;


        if (helper.textContains(text, listKeywords)) {
            meetingReminder.list = {isInUse: true};
            useStandardFunctionality = false;
        }
        else if (helper.textContains(text, deleteKeywords)) {
            meetingReminder.delete = parseDelete(text);
            useStandardFunctionality = false;
            if (meetingReminder.delete.writtenOptionsWrong === true) {
                meetingReminder.isInUse = false;
                meetingReminder.writtenOptionsWrong = true;
            }
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

        if (numServices === 0 && useStandardFunctionality === true) {
            var addMeeting = parseAddMeeting(text);
            if (addMeeting.isInUse === true) {
                meetingReminder.addMeeting = addMeeting;
            }
            else if (addMeeting.writtenOptionsWrong === true) {
                meetingReminder.isInUse = false;
                meetingReminder.writtenOptionsWrong = true;
                meetingReminder.addMeeting = addMeeting;
            }
            else {
                meetingReminder.isInUse = false;
            }
        }
    }

    logger.debug("[optionParser] meetingReminderOpts: " + JSON.stringify(meetingReminder));
    

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

var parseDelete = function (text) {
    logger.debug("optionParser.parseDelete()");

    var meetingDeleter = {};

    var partials = text.split(' ');

    var use = partials.map(function (partial) {
        if (new RegExp(/^[0-9]*$/).test(partial) === true) {
            return {isCorrect: true, val: partial};
        }
        else {
            return {isCorrect: false, val: partial};
        }
    }).reduce(function (val, newVal) {
        if (val.hasCorrect === 0 && newVal.isCorrect === true) {
            return {hasCorrect: 1, val: newVal.val};
        }
        else if (val.hasCorrect === 1 && newVal.isCorrect === true) {
            return {hasCorrect: -1, val: -1};
        }
        else {
            return val;
        }
    }, {hasCorrect: 0, val: -1});

    if (use.hasCorrect === 1) {
        meetingDeleter = {
            isInUse: true,
            id: use.val
        };
    }
    else {
        meetingDeleter = {
            isInUse: false,
            writtenOptionsWrong: true
        };
    }

    return meetingDeleter;
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
    parseDelete: parseDelete,
    validate: validate
};