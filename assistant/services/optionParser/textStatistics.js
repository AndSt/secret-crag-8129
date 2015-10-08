'use strict';

var config = require("./../../config.json");

var logger = require(config.loggerPath);
var helper = require(config.root + "/utils/stringHelper");

var parsingOptions = require(config.root + '/files/parsingOptions.json');


var parse = function (text) {
    logger.debug("optionParser.textStatistics()");

    var textStatistics = {
        isInUse: false,
        options: {}
    };

    var textStatsParsingOpts = parsingOptions.services.textStatistics;

    if (helper.textContains(text, textStatsParsingOpts.keywords)) {
        textStatistics.isInUse = true;
    }

//    var daysRegExp = /[1-9][0-9]?\sdays/ig;
//
//    if (daysRegExp.test(text)) {
//        var blub = text.match(daysRegExp).split(' ');
//        logger.info("INFO:  " + JSON.stringify(blub));
//    }

    return textStatistics;
};


module.exports = {
    parse: parse
};