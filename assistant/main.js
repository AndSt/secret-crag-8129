
var config = require('./config.json');

var fs = require('fs');

var logger = require(config.loggerPath);
var comm = require(config.root + '/utils/communicator');
var htmlSanitize = require('sanitize-html');

var help = require('./services/help/help');
var meetingReminder = require('./services/meetingReminder/meetingReminder');
var addFile = require('./services/addFile/addFile');
var textStatistics = require('./services/textStatistics/main');
var feedback = require('./services/feedback/feedback');

var optionParser = require('./services/optionParser/optionParser');
var dbFunctions = require('./dbFunctions');

var messages = require("./files/messages.json");


var addedToConversationEvent = function (item) {
    logger.debug("addedToConversationEvent( " + item.convId + " )");

    return new Promise(function (resolve, reject) {

        comm.getLastItems(item.convId, 1000)
                .then(function (items) {
                    var promises = [];
                    items.forEach(function (itemm) {
                        promises.push(textStatistics.insertTextItemIntoDatabase(itemm));
                    });

                    Promise.all(promises)
                            .then(function () {
                                resolve(comm.sendTextItem(item.convId, "Here am I!!!"));
                            });
                });
    });
};


var textItemAddedEvent = function (item) {
    logger.debug('textItemEvent( ' + ' )');

    if (item.creatorId !== config.userId) {
        textStatistics.insertTextItemIntoDatabase(item)
                .then(textStatistics.sendToGA)
                .then(checkConversationStatus)
                .then(function (options) {
                    if (options.useOptionParser === true) {
                        parseItem(item)
                                .catch(function (err) {
                                    logger.debug("No answer needed, because: " + err);
                                });
                    }
                    else {
                        logger.debug("No answer will be given");
                    }
                });
    }
};

var textItemUpdatedEvent = function (item) {
    logger.debug('textItemEvent( ' + item.itemId + ' )');

    if (item.creatorId !== config.userId) {
        dbFunctions.selectItem(item.itemId)
                .then(function (rows) {
                    if (rows.length > 1) {
                        logger.error("Failure in database. More than one item with id" + item.itemId);
                        reject("Failure in database. More than one item with id" + item.itemId);
                    }
                    else if (rows.length === 0) {
                        textItemAddedEvent(item);
                    }
                    else {
                        if (rows[0].text === item.text.substring(0, rows[0].text.length)) {
                            var text = htmlSanitize(item.text.substring(rows[0].text.length, item.text.length), {allowedTags: false});
                            logger.info("updatedText: " + item.text);
                            textStatistics.updateTextItem(item)
                                    .then(function () {
                                        item.text = text;
                                        return checkConversationStatus(item);
                                    })
                                    .then(function (options) {
                                        logger.info("updateOptions: " + JSON.stringify(options));
                                        if (options.useOptionParser === true) {
                                            parseItem(item).catch(function (err) {
                                                logger.debug("No answer needed, because: " + err);
                                            });
                                        }
                                        else {
                                            logger.debug("No answer will be given");
                                        }
                                    });
                        }
                    }
                })
                .catch(function (err) {
                    reject(err);
                });
    }
};


var conferenceFinishedEvent = function (item) {
    logger.debug('conferenceFinishedEvent( ' + ' )');
    logger.debug('[eventListener] conference finished: ' + JSON.stringify(item));

    meetingReminder.askForRepetition(item);
};



var checkConversationStatus = function (item) {
    logger.debug("checkConversationStatus( " + item.convId + " )");

    return new Promise(function (resolve, reject) {

        dbFunctions.selectConversationStatus(item).then(function (rows) {
            if (rows.length > 1) {
                logger.error("[main] too much conversation statuses set");
                reject("Too much statuses for conversation " + item.convId);
            } else if (rows.length === 0) {
                logger.debug("[main] No status set for the conversation");
                resolve({useOptionParser: true});
            }
            else {
                logger.debug("rows of convStatus: " + JSON.stringify(rows));
                switch (rows[0].status) {
                    case '1' :
                        resolve(meetingReminder.processRepetitionAnswer(item,
                                rows[0]));
                        break;
                    default:
                        logger.error("[main]: Wrong data in the database, " +
                                "as the conversation status is not set");
                        reject("wrong conversation status");
                }
            }
        }).catch(function (err) {
            reject(err);
        });
    });
};


var parseItem = function (item) {
    logger.debug("parseItem( " + item.itemId + " )");

    return new Promise(function (resolve, reject) {

        var options = optionParser.parseOptions(item);
        logger.debug(JSON.stringify(options));
        if (options.hasOwnProperty("help") && options.help.isInUse === true) {
            logger.info("The answer will be help");
            resolve(help.parseHelp(options));
        }
        else if (options.hasOwnProperty("error")) {
            logger.debug("The input text has the wrong format");
            comm.sendTextItem(item.convId, messages.errors[options.error], item.itemId);
        }
        else if (options.isInUse === true) {
            logger.debug("Service is used now");
            if (options.services.hasOwnProperty("meetingReminder")) {
                if (options.services.meetingReminder.isInUse === true) {
                    resolve(meetingReminder.start(options));
                }
            }
            else if (options.services.hasOwnProperty("addFile")) {
                if (options.services.addFile.isInUse === true) {
                    resolve(addFile.start(options));
                }
            }
            else if (options.services.hasOwnProperty("feedback")) {
                if (options.services.feedback.isInUse) {
                    resolve(feedback.start(options));
                }
            }
            else if (options.services.hasOwnProperty("textStatistics")) {
                if (options.services.textStatistics.isInUse) {
                    resolve(textStatistics.start(options));
                }
            }
            else {
                reject("The assistent must not answer");
            }
        }
        else if (options.writtenOptionsWrong === true) {
            comm.sendTextItem(item.convId, messages.writtenOptionsWrong, item.itemId);
        }
        else {
            reject("The assistent must not answer");
        }
    });
};

/**
 * deleteFiles() deletes temporary files
 */
var deleteFiles = function () {
    logger.debug("main.deleteFiles()");

    var regExps = [/^meeting.*ics$/ig, /^pie.*png$/];

    fs.readdir(config.root + "/files", function (err, files) {
        if (err) {
            logger.error("update.deleteFiles did not work: " + err);
        }
        files.forEach(function (file) {
            for (var i = 0; i < regExps.length; i++) {
                if (regExps[i].test(file)) {
                    fs.unlink(config.root + '/files/' + file, function (err) {
                        if (err) {
                            logger.error("update.deleteFiles did not work: " + err);
                        }
                    });
                    break;
                }
            }
        });
    });
};

var update = function () {
    logger.info("main.update()");
    meetingReminder.update();
    deleteFiles();
};


module.exports = {
    textItemAddedEvent: textItemAddedEvent,
    textItemUpdatedEvent: textItemUpdatedEvent,
    conferenceFinishedEvent: conferenceFinishedEvent,
    parseItem: parseItem,
    checkConversationStatus: checkConversationStatus,
    update: update
};