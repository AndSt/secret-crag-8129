
//var config = require('./../../config/config.json');

var mysql = require('mysql');
var dbConn = require('./../../utils/database').getConnection();
var logger = require('./../../utils/logger');
var time = require('./../../utils/time');
var comm = require('./../../utils/communication');


var underscore_string = require("underscore.string");

var dbFunctions = require('./dbFunctions');

/*
 * addMeeting() adds a new meeting to the table remindMeetings
 * 
 * @param {circuit.Item}        the item to add
 * @param {object} options      see optionParser for overview over all options
 * @returns {Promise}           string with true/false statement
 */
var addMeeting = function (item, options) {
    logger.debug("meetingReminder.addMeeting( " + item.itemId + " ) with " +
            "options: " + JSON.stringify(options));

//    if (config.test === true) {
//        if (item.testRepetition === true) {
//            return;
//        }
//    }

    return new Promise(function (resolve, reject) {

        //time setup
        var unixDate = time.getUnixTimeStamp(options.date);
        var reminderDate = unixDate - 300;
        var sentReminder = 0;
        if (time.getUnixTimeStamp() >= unixDate - 20) {
            sentReminder = 1;
        }
        //query to insert new meeting
        var query = "INSERT INTO `remindMeetings`(`convId`, `inputItemId`, " +
                "`inputText`, `date`, `reminderDate`, `sentReminder`) " +
                "VALUES ('" + item.convId + "', '" + item.itemId + "', '" +
                item.text.content + "', '" + unixDate + "', '" +
                reminderDate + "', '" + sentReminder + "')";

        logger.debug("[meetingReminder] addMeetingQuery: " + query);

        dbFunctions.insertMeeting(item, unixDate, reminderDate, sentReminder)
                .then(function () {
                    comm.sendTextItem(item.convId, "A new meeting was added. " +
                            "You will be reminded on " +
                            time.getUserOutputDate(reminderDate) + " GMT.");

                    resolve("Inserting of remindMeeting went well");
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
                Math.floor(item.rtc.ended.duration / 1000);


        //Same date one week later
        var newDate = finishedMeetingBegin + (7 * 24 * 60 * 60);

        var sendString = "Do you want to assign a new meeting " +
                "on " + time.getUserOutputDate(newDate) + " ? " +
                "Please answer: 'meeting assistant: yes' or " +
                "'meeting assistant: no'";

        comm.sendTextItem(item.convId, sendString);

        var information = {
            oldDate: finishedMeetingBegin,
            newDate: newDate,
            addedQuestionTime: time.getUnixTimeStamp()
        };

        dbFunctions.insertConversationStatus(item, information)
                .then(function () {
                    resolve("Successfully asked for repetition.");
                }).catch(function (err) {
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
        var text = underscore_string.clean(item.text.content);

        var regex = new Regex(/^(meeting\sassistent\:|ma\:)\s(yes|no)$/);

        if (regex.test(text.toLowerCase()) === true) {
            logger.debug("[meetingReminder] repetitionAnswer was made");

            dbFunctions.updateConversationStatusActive(status)
                    .then(function () {
                        if (text.indexOf("no") > -1) {
                            logger.debug("[meetingReminder]: status '" + status.ID +
                                    "' was answered with false");
                            resolve({useOptionParser: true});
                        }
                        else {
                            logger.debug("[meetingReminder]: status '" + status.ID +
                                    "' was answered with true");
                            var information = JSON.parse(status.information);
                            addMeeting(item, {date: information.newDate * 1000})
                                    .then(function (text) {
                                        resolve({useOptionParser: false});
                                    })
                                    .catch(function (err) {
                                        resolve({useOptionParser: false});
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

                var meeting;
                for (var i = 0; i < rows.length; i++) {

                    //send reminder messages
                    meeting = rows[i];
                    // send text
                    var sendString = "On " + time.getUserOutputDate(meeting.date) +
                            " GMT starts a new meeting";

                    comm.sendTextItem(meeting.convId, sendString);

                    //update sentReminder flags
                    dbFunctions.updateRemindMeetingsSentReminder(meeting.ID);
                }
            });
};

module.exports = {
    addMeeting: addMeeting,
    askForRepetition: askForRepetition,
    processRepetitionAnswer: processRepetitionAnswer,
    update: update
};