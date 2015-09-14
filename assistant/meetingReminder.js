
var mysql = require('mysql');
var dbConn = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var time = require('./../utils/time');
var comm = require('./communication');

/*
 * adds a new meeting to the table remindMeetings
 * 
 * @param {circuit.Item}        the item to add
 * @param {object} options      see optionParser for overview over all options
 * @returns {Promise}           string with true/false statement
 */

var addMeeting = function (item, options) {
    logger.debug("meetingReminder.addMeeting( " + item.itemId + " ) with " +
            "options: " + JSON.stringify(options));

    return new Promise(function (resolve, reject) {

        var unixDate = time.getUnixTimeStamp(options.date);
        var reminderDate = unixDate - 300;
        var sentReminder = 0;
        if (time.getUnixTimeStamp() >= unixDate - 20) {
            sentReminder = 1;
        }
        var query = "INSERT INTO `remindMeetings`(`convId`, `inputItemId`, " +
                "`inputText`, `date`, `reminderDate`, `sentReminder`) " +
                "VALUES ('" + item.convId + "', '" + item.itemId + "', '" +
                item.text.content + "', '" + unixDate + "', '" +
                reminderDate + "', '" + sentReminder + "')";

        logger.debug("[meetingReminder] addMeetingQuery: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error("[meetingReminder] Error while inserting " +
                        +"a remindMeeting, because: " + err);
                reject("Error while inserting a remindMeeting. " +
                        "Please try again.");
            }
            else {
                logger.info("[meetingReminder] Inserting of " +
                        "remindMeeting " + "went well");
                resolve("Inserting of remindMeeting went well");
            }
        });
    });
};


var askForRepetition = function (item) {
    console.debug("meetingReminder.askForRepetition( " + item.itemId + " )")

    return new Promise(function (resolve, reject) {

        var finishedMeetingBegin = time.getUnixTimeStamp() -
                Math.floor(item.rtc.duration / 1000);


        //Same date one week later
        var newDate = finishedMeetingBegin + (7 * 24 * 60 * 60);

        var dateString = time.getUserOutputDate(newDate);

        comm.sendTextItem(item.convId, "Do you want to assign a new meeting " +
                "on " + dateString + " ?");

        var information = {
            oldDate: finishedMeetingBegin,
            newDate: newDate,
            addedQuestionTime: time.getUnixTimeStamp()
        };

        query = "INSERT INTO `ConversationStatus`(`convId`, " +
                "`status`, `information`, `active`) " +
                "VALUES ('" + item.convId + "', '1', " +
                "'" + JSON.stringify(information) + "', '0')";
        console.debug("[meetingReminder]: askForRepetitionQuery2: " + query);

        dbConn.query(query, function (err2) {
            if (err2) {
                console.error("[meetingReminder]: Error while inserting " +
                        "status 1 into ConversationStatus");
                reject("Error while inserting " +
                        "status 1 into ConversationStatus");
            }

            resolve();
        });
    });
};

/*
 * the update function checks, if any remindings have to be sent.
 * Then it sends the remindings and updates the database
 */
var update = function () {
    logger.debug('meetingReminder.update()');

    // actual timestamp in UTC/GMT+0(berlin, germany)
    var now = time.getUnixTimeStamp();

    // choose every meeting, which has an expired reminderDate
    dbConn.query("SELECT * FROM  `remindMeetings` " +
            "WHERE  `sentReminder` =  '0' " +
            " AND  `reminderDate` <  '" + now + "'",
            function (err, rows) {
                if (err) {
                    logger.error("[meetingReminder] Fetching the meetings " +
                            "the database failed.");
                }
                else {
                    logger.info("[meetingReminder] check started at " + now +
                            " and " + rows.length + " meetings will " +
                            "be updated");
                    var meeting, id;
                    for (var i = 0; i < rows.length; i++) {

                        //send reminder messages
                        meeting = rows[i];
                        var dateString = time.getUserOutputDate(meeting.date);
                        id = meeting.ID;
                        // send text
                        comm.sendTextItem(meeting.convId,
                                "On " + dateString + " GMT starts a new " +
                                "meeting"
                                );

                        // update the sentReminder flag
                        dbConn.query("UPDATE `remindMeetings` " +
                                "SET `sentReminder`='1' " +
                                "WHERE `ID` = '" + id + "'",
                                function (err) {
                                    if (err) {
                                        logger.error("[meetingReminder] " +
                                                "sentReminder of ID " +
                                                id + " couldn't be updated ," +
                                                "because: " + err);
                                    }
                                    else {
                                        logger.info("[meetingReminder] " +
                                                "sentReminder of ID " +
                                                id + " was updated " +
                                                "successfully.");
                                    }
                                });
                    }
                }
            });
};

module.exports = {
    addMeeting: addMeeting,
    askForRepetition: askForRepetition,
    update: update
};