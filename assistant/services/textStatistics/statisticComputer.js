'use strict';

var config = require("./../../config.json");

var logger = require(config.loggerPath);


var computeStats = function (text, numConcats) {
    logger.debug("textStatistics.computeStats()");


    var letterCount = 0;
    var tmp = text.split(' ');
    tmp.forEach(function (word) {
        letterCount += word.length;
    });

    var stats = {
        letterCount: letterCount,
        wordCount: text.split(' ').length,
        sentenceCount: text.split('.').length - 1,
        commaCount: text.split(',').length - 1,
        questionCount: text.split('?').length - 1,
        exclaCount: text.split('!').length - 1
    };

    return stats;

};


module.exports = {
    computeStats: computeStats
};