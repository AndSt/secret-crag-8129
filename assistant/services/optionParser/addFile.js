'use strict';

var config = require("./../../config.json");

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var logger = require(config.loggerPath);
var helper = require(config.root + "/utils/stringHelper");



var parse = function (text) {
    logger.debug("testAddFile( " + text + " )");

    var addFile = {
        isInUse: false
    };

    var keywords = parsingOptions.services.addFile.keywords;
    if (helper.textContains(text, keywords)) {

        var parts = text.split(" ");
        var url = parts.reduce(function (value, part) {
            if (value === "tooManyValues") {
                return value;
            }
            if (helper.textStartsWith(part, ["http://", "https://"])) {
                if (value !== "-1") {
                    return "tooManyValues";
                }
                return part;
            }
            return value;
        }, "-1");

        if (url === "-1") {
            addFile.foundUrl = false;
        } else if (url === "tooManyValues") {
            addFile.hasTooManyValues = true;
        }
        else {
            addFile.isInUse = true;
            addFile.url = url;
        }
    }

    return addFile;

};

module.exports = {
    parse: parse
};