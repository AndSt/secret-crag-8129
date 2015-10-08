'use strict';

var config = require("./../config.json");

var underscore_string = require("underscore.string");

var logger = require(config.loggerPath);


/*
 * textStartsWith() checks if a text starts at least with one element of an 
 * array of strings 
 * 
 * @param {type} text       the text, which will be searched
 * @param {array} sources   array of strings
 * @returns {boolean}       true if found/ false if not found
 */
var textStartsWith = function (text, sources) {
    logger.debug("optionsParser.helper.textStartsWith()");

    var cleanedText = underscore_string.clean(text).toLowerCase();

    return sources.reduce(function (prevVal, row) {
        var regExp = new RegExp("^" + row.toLowerCase() + ".*$", "g");
        return (prevVal || regExp.test(cleanedText));
    }, false);
};


/*
 * textContains() checks if a text contains at least one element of an array of strings 
 * 
 * @param {type} text       the text, which will be searched
 * @param {array} sources   array of strings
 * @returns {boolean}       true if found/ false if not found
 */
var textContains = function (text, sources) {
    logger.debug("optionsParser.helper.textContains(" + text + ", " +
            JSON.stringify(sources) + " )");

    var cleanedText = underscore_string.clean(text).toLowerCase();

    return sources.reduce(function (prevVal, row) {
        return (prevVal || cleanedText.indexOf(row.toLowerCase()) > -1);
    }, false);
};


module.exports = {
    textStartsWith: textStartsWith,
    textContains: textContains
};
