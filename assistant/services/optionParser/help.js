'use strict';

var config = require("./../../config.json");

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var logger = require(config.loggerPath);
var helper = require("./helper");


var parse = function (text) {
    logger.debug("optionParser.help.parse(" + text + ")");

    var help = {
        isInUse: false,
        functions: {}
    };

    if (helper.textContains(text, parsingOptions.services.help.keywords)) {
        help.isInUse = true;
        if (helper.textContains(text, parsingOptions.services.meetingReminder.keywords)) {
            help.functions.meetingReminder = true;
        }
    }

    logger.debug(JSON.stringify(help));
    return help;
};



module.exports = {
    parse: parse
};