

var mysql = require('mysql');
var dbConn = require('./../../utils/database').getConnection();
var logger = require('./../../utils/logger');
var time = require('./../../utils/time');


var insertMeeting = function (item, unixDate, reminderDate, sentReminder) {

    return new Promise(function (resolve, reject) {

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
            logger.debug("[meetingReminder] Inserting of " +
                    "remindMeeting " + "went well");
            resolve();
        });
    });
};

var insertConversationStatus = function (item, information) {

    return new Promise(function (resolve, reject) {

        var query = "INSERT INTO `ConversationStatus`(`convId`, " +
                "`status`, `information`, `active`) " +
                "VALUES ('" + item.convId + "', '1', " +
                "'" + JSON.stringify(information) + "', '1')";
        logger.debug("[meetingReminder]: askForRepetitionQuery: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error("[meetingReminder]: Error while inserting " +
                        "status 1 into ConversationStatus: " + err);
                reject("Error while inserting " +
                        "status 1 into ConversationStatus");
            }
            logger.debug("[meetingReminder] Successfully inserted a " +
                    "status 1 into ConversationStatus");
            resolve();
        });
    });
};

var updateConversationStatusActive = function (status) {

    return new Promise(function (resolve, reject) {
        var query = "UPDATE `ConversationStatus` " +
                "SET `active` = 0 WHERE `ID` = '" + status.ID + "'";
        logger.debug("[meetingReminder]: updateConversation" +
                "StatusQuery: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error("[meetingReminder]: Error while updating " +
                        "conversation status: " + err);
                reject("Error while updating conversation status");
            }
            logger.debug("[meetingReminder]: Successfully updated " +
                    "the conversation status of " + status.convId);
            resolve();
        });
    });
};

var selectToRemindMeetings = function () {

    // actual timestamp in UTC/GMT+0(berlin, germany)
    var now = time.getUnixTimeStamp();

    return new Promise(function (resolve, reject) {
        var query = "SELECT * FROM  `remindMeetings` " +
                "WHERE  `sentReminder` =  '0' " +
                " AND  `reminderDate` <  '" + now + "'";
        logger.debug("[meetingReminder]: selectToRemindMeetingsQuery:" +
                query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error("[meetingReminder] Fetching the meetings " +
                        "from the database failed.");
                reject("Fetching the meetings from the database failed.");
            }
            logger.info("[meetingReminder]" + rows.length +
                    " meetings will be updated");
            resolve(rows);
        });
    });
};

var updateRemindMeetingsSentReminder = function (id) {

    var query = "UPDATE `remindMeetings` " +
            "SET `sentReminder`='1' " +
            "WHERE `ID` = '" + id + "'";
    logger.debug("updateRemindMeetingsSentReminderQuery: " + query);

    dbConn.query("UPDATE `remindMeetings` " +
            "SET `sentReminder`='1' " +
            "WHERE `ID` = '" + id + "'",
            function (err) {
                if (err) {
                    logger.error("[meetingReminder] sentReminder of ID " +
                            id + " couldn't be updated ,because: " + err);
                }
                else {
                    logger.info("[meetingReminder] sentReminder of ID " +
                            id + " was updated successfully.");
                }
            });
};

module.exports = {
    insertMeeting: insertMeeting,
    insertConversationStatus: insertConversationStatus,
    updateConversationStatusActive: updateConversationStatusActive,
    selectToRemindMeetings: selectToRemindMeetings,
    updateRemindMeetingsSentReminder: updateRemindMeetingsSentReminder
};



