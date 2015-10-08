'use strict';

var config = require("./../../config.json");

var logger = require(config.loggerPath);
var comm = require(config.root + '/utils/communicator');

var messages = require(config.root + '/files/messages.json');


var parseHelp = function (options) {
    logger.debug("help.parseHelp()");

    return new Promise(function (resolve, reject) {
        
        if(options.help.service === "general"){
            resolve(comm.sendTextItem(options.convId, messages.help.text, options.itemId));
        }
        else if(options.help.service === "meetingReminder"){
            resolve(comm.sendTextItem(options.convId, messages.help.meetingReminder.text, options.itemId));
        }
        else if(options.help.service === "textStatistics")  {
            resolve(comm.sendTextItem(options.convId, messages.help.textStatistics.text, options.itemId));
        }     
        reject("no valid configuration");
    });
};

module.exports = {
    parseHelp: parseHelp
};


