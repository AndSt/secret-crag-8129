'use strict';

var config = require("./../../config.json");

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var logger = require(config.loggerPath);
var helper = require(config.root + "/utils/stringHelper");


var parse = function (text) {
    logger.debug("optionParser.help.parse(" + text + ")");

    var help = {
        isInUse: false
    };

    if (helper.textContains(text, parsingOptions.services.help.keywords)) {

        var services = parsingOptions.services.help.helpServices;

        var service1 = services.map(function (service) {
            if (helper.textContains(text, parsingOptions.services[service].keywords)) {
                return {isInUse: true, name: service};
            }
            else {
                return {isInUse: false, name: service};
            }
        });

        var service = service1.reduce(function (val, func) {
            if (val.isInUse === 0) {
                logger.debug("1");
                return val;
            }
            else if (func.isInUse === true && val.isInUse === 1) {
                logger.debug("2");
                return {isInUse: 0, name: ''};
            }
            else if (func.isInUse === true) {
                logger.debug("3");
                return {isInUse: 1, name: func.name};
            }
            else {
                return val;
            }
        }, {isInUse: -1, name: ''});


        if (service.isInUse === -1 || service.isInUse === 0) {
            help.isInUse = true;
            help.service = 'general';
        }
        else {
            help.isInUse = true;
            help.service = service.name;
        }
    }

    logger.debug(JSON.stringify(help));
    return help;
};


module.exports = {
    parse: parse
};