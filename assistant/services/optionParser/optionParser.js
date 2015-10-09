var config = require("./../../config.json");

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var logger = require(config.loggerPath);
var time = require(config.root + '/utils/time');
var helper = require(config.root + "/utils/stringHelper");

var helpParser = require("./help");
var meetingReminderParser = require("./meetingReminder");
var feedbackParser = require("./feedback");
var textStatisticParser = require('./textStatistics');

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
        writtenOptionsWrong: false,
        help: {
            isInUse: false
        },
        services: {
        }
    };


    if (helper.textStartsWith(item.text, parsingOptions.assistantKeywords)) {

        options.isInUse = true;
        var text = item.text.substr(item.text.indexOf(":"), item.text.length - 1);
        logger.debug("[optionParser] Parsing text: " + text);

        options.help = helpParser.parse(text);
        if (options.help.isInUse === true) {
            logger.debug("Help is in Use");
            return options;
        }
        else {

            var services = {
                meetingReminder: meetingReminderParser.parse(text),
                feedback: feedbackParser.parse(text),
                textStatistics: textStatisticParser.parse(text)
            };

            for (var key in services) {
                if (services[key].isInUse) {
                    options.services[key] = services[key];
                }
                else if (services[key].writtenOptionsWrong) {
                    options.writtenOptionsWrong = true;
                }
            }
        }
    }
    logger.info("Options are rendered: " + JSON.stringify(options));

    if (options.isInUse === true) {
        return validate(options);
    }
    else {
        return options;
    }
};


/**
 * parseAnswer() gets called, if the assistant asked for something and waits for an answer
 * @param {type} item       the newest item, which could be an answer
 * @returns {undefined}     options object: {isInUse:'true, if answer given', answer:'yes or false, depending on answer}'
 */
var parseAnswer = function (item) {

    var options = {
        convId: item.convId,
        itemId: item.itemId,
        modificationTime: item.modificationTime,
        creationTime: item.creationTime,
        isInUse: false,
        writtenOptionsWrong: false
    };

    if (helper.textStartsWith(item.text, parsingOptions.assistantKeywords)) {

        if (helper.textContains(item.text, ['yes'])) {
            if (helper.textContains(item.text, ['no'])) {
                options.isInUse = false;
                options.writtenOptionsWrong = true;
            }
            else {
                options.isInUse = true;
                options.answer = 'yes';
            }
        }
        else {
            if (helper.textContains(item.text, ['no'])) {
                options.isInUse = true;
                options.answer = 'no';
            }
            else {
                options.isInUse = false;
            }
        }
    }

    return options;
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

    if (numServices > 1) {
        return {error: "tooMuchServices"};
    }
    if (numServices === 1) {
        if (options.services.hasOwnProperty('meetingReminder')
                && options.services.meetingReminder.isInUse === true) {
            var result = meetingReminderParser.validate(options.services.meetingReminder);
            if (result === true) {
                return options;
            }
            else {
                return {error: result};
            }
        }
        return options;
    }
//numServices == 0...
    return {error: "writtenOptionsWrong"};
};


module.exports = {
    parseOptions: parseOptions,
    parseAnswer: parseAnswer,
    validate: validate
};
