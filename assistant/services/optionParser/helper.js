'use strict';

var config = require("./../../config.json");

var underscore_string = require("underscore.string");

var logger = require(config.loggerPath);


var textStartsWith = function (text, sources) {
    logger.debug("optionsParser.helper.textStartsWith()"  );
    
    var cleanedText = underscore_string.clean(text).toLowerCase();

    return sources.reduce(function (prevVal, row) {
        var regExp = new RegExp("^" + row.toLowerCase() + ".*$", "g");
        return (prevVal || regExp.test(cleanedText));
    }, false);
};


var textContains = function (text, sources) {
    logger.debug("optionsParser.helper.textContains()"  );
    
    var cleanedText = underscore_string.clean(text).toLowerCase();

    return sources.reduce(function (prevVal, row) {
        return (prevVal || cleanedText.indexOf(row) > -1);
    }, false);
};


module.exports = {
    textStartsWith: textStartsWith,
    textContains: textContains
};
