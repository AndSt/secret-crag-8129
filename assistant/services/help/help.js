
var config = require("./../../config.json");

var logger = require(config.loggerPath);
var comm = require(config.root + '/utils/communicator');


var parseHelp = function (options) {
    logger.debug("help.parseHelp()");

    return new Promise(function (resolve, reject) {

        //check that only help for one function is requested
        var numFunctions = 0;
        for (var key in options.help.functions) {
            if (options.help.functions[key]) {
                numFunctions++;
            }
        }

        if (numFunctions === 0) {
            resolve(generalHelp(options));
        }
        else if (numFunctions === 1) {
            if (options.help.functions.meetingReminder === true) {
                resolve(meetingReminderHelp(options));
            }
        }
        reject("no valid configuration");
    });
};

var generalHelp = function (options) {
    logger.debug("help.generalHelp()");

    return new Promise(function (resolve, reject) {

        var text = "Help: \n To speak with the meeting assistant your sentence" +
                " has to start with \'meeting assistant:\' or with \'ma:\'\n" +
                "For which function do you need help? \n " +
                "\'ma: help remind' for a meeting reminding \n " +
                "\'ma: help statistics' for help on statisics \n " +
                " Further information on http://secret-crag-8129.herokuapp.com/help";

        resolve(comm.sendTextItem(options.convId, text, options.itemId));
    });
};

var meetingReminderHelp = function (options) {
    logger.debug("help.generalHelp()");

    return new Promise(function (resolve, reject) {

        var text = "Help for the reminding functionalit: \n" +
                "the general format is \'ma: remind \%time\%\' \n" +
                "%time% has following format: /mm/dd/yyyy HH:MM \n" +
                "'m' is the month, 'd' ist the day, 'y' is the year, " +
                "'H' ist the horu, 'M' ist the minute. For example mm means " +
                "that the month must be written with two letters. " +
                "Further information on http://secret-crag-8129.herokuapp.com/help";

        resolve(comm.sendTextItem(options.convId, text, options.itemId));
    });
};

module.exports = {
    parseHelp: parseHelp
};


