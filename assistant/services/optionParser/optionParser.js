var config = require("./../../config.json");

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var logger = require(config.loggerPath);
var time = require(config.root + '/utils/time');

var helper = require('./helper');

var helpParser = require("./help");
var meetingReminderParser = require("./meetingReminder");
var addFileParser = require("./addFile");


/*
 * fills the options object
 * 
 * @param {string} text     text, which shall be passed
 * @returns {Promise}       options object or err string
 */
var parseOptions = function (item) {

    var options = {
        convId: item.convId,
        itemId: item.itemId,
        creatorId: item.creatorId,
        modificationTime: item.modificationTime,
        creationTime: item.creationTime,
        isInUse: false,
        help: {
            isInUse: false
        },
        services: {
        }
    };


    if (helper.textContains(item.text, parsingOptions.assistantKeywords)) {
        logger.debug("The meeting assistant is in use");
        options.isInUse = true;

        options.help = helpParser.parse(item.text);
        if (options.help.isInUse === true) {
            logger.debug("Help is in Use");
            return options;
        }
        else {
            var meetingReminder = meetingReminderParser.parse(item.text);
            if (meetingReminder.isInUse) {
                options.services.meetingReminder = meetingReminder;
            }

            var addFile = addFileParser.parse(item.text);
            if (addFile.isInUse) {
                options.services.addFile = addFile;
            }
        }
    }
    logger.info("Options are rendered: " +
            JSON.stringify(options));

    var result = validate(options);
    if (result.hasOwnProperty("error")) {
        return result;
    }
    else {
        return options;
    }
};

var validate = function (options) {
    logger.debug('validateOptions( ' + options.itemId + ' )');

    if (options.isInUse === false) {
        return options;
    }

    var numServices = 0;
    for (var key in options.services) {
        if (options.services[key].isInUse === true) {
            numServices++;
        }
    }
    if(numServices === 0){
        options.isInUse = false;
        return true;
    }
    if (numServices > 1) {
        return {error: "tooMuchServices"};
    }


    if (options.services.meetingReminder.isInUse === true) {
        var result = meetingReminderParser.validate(options.services.meetingReminder);
        if (result === true) {
            return options;
        }
        else {
            return {error: result};
        }
    }

    return {error: "optionsWrittenWrong"};
};


module.exports = {
    parseOptions: parseOptions,
    validate: validate
};
