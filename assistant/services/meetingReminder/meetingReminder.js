'use strict';

var config = require("./../../config.json");
var messages = require(config.root + "/files/messages.json");

var underscore_string = require("underscore.string");

var logger = require(config.loggerPath);
var time = require(config.root + '/utils/time');
var comm = require(config.root + '/utils/communicator');
var icsGenerator = require(config.root + '/utils/icsGenerator');
var stringHelper = require(config.root + '/utils/stringHelper');

var optionParser = require(config.root + '/services/optionParser/optionParser');

var dbFunctions = require('./dbFunctions');


/*
 * start() will be called, if the meeting reminder is in use. 
 * It chooses and starts the respective functionality
 * 
 * @param {options} options     see optionParser for overview over all options
 * @returns {Promise}           resolves or rejects error string
 */

var start = function (options) {
    logger.debug("meetingReminder.start( " + options.itemId + " )");

    return new Promise(function (resolve, reject) {

        var meetingReminder = options.services.meetingReminder;

        if (meetingReminder.hasOwnProperty("addMeeting")) {
            if (meetingReminder.addMeeting.isInUse === true) {
                resolve(addMeeting(options));
            }
        }
        else if (meetingReminder.hasOwnProperty("list")) {
            if (meetingReminder.list.isInUse === true) {
                resolve(listMeetings(options));
            }
        }
        else if (meetingReminder.hasOwnProperty("delete")) {
            if (meetingReminder.delete.isInUse === true) {
                resolve(deleteMeeting(options));
            }
        }
        else {
            reject("The meeting reminder found no compatible functionality");
        }
    });
};

/*
 * addMeeting() adds a new meeting to the table remindMeetings
 * 
 * @param {object} options      see optionParser for overview over all options
 * @returns {Promise}           string with true/false statement
 */
var addMeeting = function (options) {
    logger.debug("meetingReminder.addMeeting( " + options.itemId + " )");

    return new Promise(function (resolve, reject) {

        //time setup
        var unixDate = time.getUnixTimeStamp(options.services.meetingReminder.addMeeting.date);

        var addAndSend = function () {
            logger.debug("addAndSend()");
            return new Promise(function (res, rej) {
                var reminderDate = unixDate - 300;
                var sentReminder = 0;
                logger.info("now: " + time.getUnixTimeStamp() + ", then: " + unixDate);
                if (time.getUnixTimeStamp() >= unixDate - 20) {
                    sentReminder = 1;
                }
                var dbOptions = {
                    sendIcs: false
                };
                if (options.services.meetingReminder.addMeeting.ics === true) {
                    dbOptions.sendIcs = true;
                }
                //the first argument is options, as it contains all information of the item
                dbFunctions.insertMeeting(options, unixDate, reminderDate,
                        sentReminder, dbOptions).then(function (insertId) {

                    var messageText = messages.meetingReminder.add.text1 +
                            time.getUserOutputDate(reminderDate) +
                            messages.meetingReminder.add.text2 +
                            insertId +
                            messages.meetingReminder.add.text3;

                    if (dbOptions.sendIcs === true) {
                        icsGenerator.generateIcsForMeeting(options.convId, options.creatorId, unixDate, 0)
                                .then(function (path) {
                                    res(comm.sendTextItemWithFiles(options.convId,
                                            messageText, [path], options.itemId));
                                })
                                .catch(function (err) {
                                    rej(err);
                                });
                    } else {
                        res(comm.sendTextItem(options.convId, messageText, options.itemId));
                    }
                }).catch(function (err) {
                    rejeect(err);
                });
            });
        };

        //check, if the user added the meeting, or if he just
        //allowed the system to add a new meeting(e.g. next week)
        if (options.hasOwnProperty("creatorId")) {
            comm.getUsersById([options.creatorId])
                    .then(function (users) {

                        if (users[0].userPresenceState.timeZoneOffset) {
                            logger.info("update time offset with  " + users[0].userPresenceState.timeZoneOffset);
                            unixDate += users[0].userPresenceState.timeZoneOffset * 60;
                        }

                        resolve(addAndSend());
                    }).catch(function (err) {
                reject(err);
            });
        }
        else {
            resolve(addAndSend());
        }
    });
};


/*
 * listMeetings() sends a list of all upcoming meetings in the given conversation
 * 
 * @param {options} options     see optionParser for overview over all options
 * @returns {Promise}           return true/false string
 */
var listMeetings = function (options) {
    logger.debug("meetingReminder.listMeetings( " + options.itemId + " )");

    return new Promise(function (resolve, reject) {

        dbFunctions.selectMeetingsOfConversation(options.convId)
                .then(function (rows) {
                    var message = "";
                    if (rows.length > 0) {
                        message = messages.meetingReminder.list.text + "<ul>";
                        rows.forEach(function (row) {
                            message += "<li>" + time.getUserOutputDate(row.date) +
                                    "(Nr. " + row.ID + ")</li>";
                        });
                        message += "</ul>";

                    }
                    else {
                        message = messages.meetingReminder.list.noMeetingsText;
                    }
                    logger.debug("[meetingReminder] listMeetingsMessage: " + message);
                    resolve(comm.sendTextItem(options.convId, message, options.itemId));

                })
                .catch(function (err) {
                    reject(err);
                });
    });
};


/*
 * deleteMeeting() deletes a meeting
 * 
 * @param {options} options     see optionParser for overview over all options
 * @returns {Promise}           resolves or rejects with error string
 */
var deleteMeeting = function (options) {
    logger.debug("meetingReminder.deleteMeeting( " + options.services.meetingReminder.delete.id + " )");

    return new Promise(function (resolve, reject) {

        dbFunctions.deleteMeetingById(options.services.meetingReminder.delete.id)
                .then(function () {
                    resolve(comm.sendTextItem(options.convId, messages.meetingReminder.delete.text, options.itemId));
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};


/*
 * askForRepetition() does 2 things:
 * 1) Ask the user, if a new meeting shall be scheduled one week later
 * 2) Set status '1' in the table ConversationStatus, which means that the
 *      assistant waits for an answer in this conversation
 * 
 * @param {circuit.Item} item   the item witch the rtcItem data
 * @returns {Promise}           returns true/false string
 */
var askForRepetition = function (item) {
    logger.debug("meetingReminder.askForRepetition( " + item.itemId + " )");

    return new Promise(function (resolve, reject) {

        var finishedMeetingBegin = time.getUnixTimeStamp() -
                Math.floor(item.ended.duration / 1000);


        //Same date one week later
        var newDate = finishedMeetingBegin + (7 * 24 * 60 * 60);

        var sendString = messages.meetingReminder.repetition.text1 +
                time.getUserOutputDate(newDate) +
                messages.meetingReminder.repetition.text2;


        var sendAndInsert = function () {
            return new Promise(function (res, rej) {
                comm.sendTextItem(item.convId, sendString, item.itemId)
                        .then(function () {

                            var information = {
                                oldDate: finishedMeetingBegin,
                                newDate: newDate,
                                addedQuestionTime: time.getUnixTimeStamp()
                            };

                            dbFunctions.insertConversationStatus(item, information)
                                    .then(function () {
                                        res("Successfully asked for repetition.");
                                    })
                                    .catch(function (err) {
                                        rej(err);
                                    });
                        })
                        .catch(function (err) {
                            rej(err);
                        });
            });
        };



        dbFunctions.existsConversationStatus(item.convId)
                .then(function (rows) {
                    if (rows.length === 0) {
                        resolve(sendAndInsert());
                    }
                    else {
                        var promises = [];

                        rows.forEach(function (row) {
                            promises.push(dbFunctions.updateConversationStatusActive(row));
                        });

                        Promise.all(promises)
                                .then(function (dataArr) {
                                    resolve(sendAndInsert());
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
                    }
                })
                .catch(function (err) {
                    reject(err);
                });
    });
};

/*
 * processRepetitionAnswer() gets called, if status '1' is set in the
 *  ConversationStatus table. 
 *  If an correct answer is given the status will be set unactive and 
 *  corresponding to the answer a new meeting will be scheduled or not
 * 
 * @param {type} item
 * @param {type} status
 * @returns {Promise}
 */
var processRepetitionAnswer = function (item, status) {
    logger.debug("meetingReminder.processRepetitionAnswer( " +
            item.itemId + " )");

    return new Promise(function (resolve, reject) {
        //get rid of unneccessary blanks
        var text = underscore_string.clean(item.text).toLowerCase();

        var options = optionParser.parseAnswer(item);

        if (options.isInUse) {
            logger.debug("[meetingReminder] repetitionAnswer was made");

            dbFunctions.updateConversationStatusActive(status)
                    .then(function () {
                        if (options.answer === 'no') {
                            logger.debug("[meetingReminder]: status '" + status.ID +
                                    "' was answered with false");
                            resolve({useOptionParser: true});
                        }
                        else {
                            logger.debug("[meetingReminder]: status '" + status.ID +
                                    "' was answered with true");
                            var information = JSON.parse(status.information);
                            options.services = {
                                meetingReminder: {
                                    addMeeting: {
                                        date: information.newDate * 1000
                                    }
                                }
                            };

                            if (stringHelper.textContains(item.text, ['ics'])) {
                                options.services.meetingReminder.addMeeting.ics = true;
                            }
                            addMeeting(options)
                                    .then(function () {
                                        resolve({useOptionParser: false});
                                    })
                                    .catch(function (err) {
                                        reject(err);
                                    });
                        }
                    })
                    .catch(function (err) {
                        reject(err);
                    });
        }
        else {
            logger.debug("[meetingReminder]: No answer was given for " +
                    "status " + status.ID + " for conversation " + item.convId);
            resolve({useOptionParser: true});
        }
    });
};

/*
 * the update function checks, if any remindings have to be sent.
 * Then it sends the remindings and updates the database
 */
var update = function () {
    logger.debug('meetingReminder.update()');

    // choose every meeting, which has an expired reminderDate
    dbFunctions.selectToRemindMeetings()
            .then(function (rows) {

                rows.forEach(function (row) {
                    // send text
                    comm.sendTextItem(row.convId, messages.meetingReminder.remind);

                    //update sentReminder flags
                    dbFunctions.updateRemindMeetingsSentReminder(row.ID);
                });
            });
};

module.exports = {
    start: start,
    addMeeting: addMeeting,
    listMeetings: listMeetings,
    deleteMeeting: deleteMeeting,
    askForRepetition: askForRepetition,
    processRepetitionAnswer: processRepetitionAnswer,
    update: update
};