'use strict';

var config = require("./../../config.json");

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var logger = require(config.loggerPath);
var helper = require(config.root + "/utils/stringHelper");


var parse = function (text) {
    logger.debug("optionParser.feedback.parse()");

    var feedback = {
        isInUse: false,
        writtenOptionsWrong: false,
        service: ""
    };

    var parseOpts = parsingOptions.services.feedback;

    for(var service in parseOpts){
        if (helper.textContains(text, parseOpts[service].keywords)) {
            if (feedback.service !== "") {
                feedback.isInUse = false;
                feedback.writtenOptionsWrong = true;
                feedback.service = "";
            }
            else {
                feedback.isInUse = true;
                feedback.service = service;
            }
        }
    }

    return feedback;
};

module.exports = {
    parse: parse
};