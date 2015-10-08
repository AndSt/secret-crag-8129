'use strict';

var config = require("./../../config.json");

var logger = require(config.loggerPath);
var comm = require(config.root + '/utils/communicator');

var messages = require(config.root + '/files/messages.json');


/**
 * start() chooses the feedback-service and randomely returns one of the desired
 * answers 
 * 
 * @param {options} options     see optionParser for further description
 * @returns {Promise}           
 */
var start = function (options) {
    logger.debug("feedback.start( " + options.itemId + " )");

    return new Promise(function (resolve, reject) {

        var text = "";
        if (messages.feedback[options.services.feedback.service].hasOwnProperty("texts")) {
            var num = Math.floor(Math.random() * messages.feedback[options.services.feedback.service].texts.length);
            text = messages.feedback[options.services.feedback.service].texts[num];
        }
        else {
            text = messages.feedback[options.services.feedback.service].text;
        }

        resolve(comm.sendTextItem(options.convId, text, options.itemId));
    });
};


module.exports = {
    start: start
};