

var config = require("./../../config.json");

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var logger = require(config.loggerPath);
var time = require(config.root + '/utils/time');


var insertMeeting = function (item, unixDate, reminderDate, sentReminder, options) {
    logger.debug("meetingReminder.dbFunctions.insertMeeting()");

    return new Promise(function (resolve, reject) {

        var query = "INSERT INTO `remindMeetings`(`convId`, `inputItemId`, " +
                "`date`, `reminderDate`, `sentReminder`, `options`) " +
                "VALUES ('" + item.convId + "', '" + item.itemId + "', '" +
                unixDate + "', '" + reminderDate + "', '" + sentReminder + "', '" +
                JSON.stringify(options) + "')";

        logger.debug("[meetingReminder] addMeetingQuery: " + query);

        dbConn.query(query, function (err, result) {
            if (err) {
                logger.error("[meetingReminder] Error while inserting " +
                        +"a remindMeeting, because: " + err);
                reject("Error while inserting a remindMeeting. " +
                        "Please try again.");
            }
            else {
                logger.debug("[meetingReminder] Inserting of " +
                        "remindMeeting " + "went well");
                resolve(result.insertId);
            }
        });
    });
};

var selectMeetingsOfConversation = function (convId) {
    logger.debug("meetingReminder.dbFunctions.selectMeetingsOfConversation");

    return new Promise(function (resolve, reject) {

        var query = "SELECT * FROM `remindMeetings` " +
                "WHERE convId = '" + convId + "' AND sentReminder = '0'";
        logger.debug("[meetingReminder]: listMeetingsQuery: " + query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error("[meetingReminder]: Error while selecting " +
                        "all meetings for conversation" + convId + ": " + err);
                reject("Error while selecting all meetings for conversation " + convId);
            }
            else {
                logger.debug("[meetingReminder] Successfully selected all " +
                        "meetings for conversation " + convId);
                logger.info(JSON.stringify(rows));
                resolve(rows);
            }
        });
    });
};


var deleteMeetingById = function (id) {
    logger.debug("meetingReminder.dbFunctions.deleteMeetingById(" + id + ")");

    return new Promise(function (resolve, reject) {

        var query = "DELETE FROM `remindMeetings` " +
                "WHERE ID='" + id + "'";
        logger.debug("[meetingReminder] deleteMeetingByIdQuery: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error("[meetingReminder] deleteMeetingQuery went wrong");
                reject("Error while deleting a meeting");
            }
            else {
                logger.debug("[meetingReminder] Successfully deleted a meeting");
                resolve();
            }
        });
    });
};


var insertConversationStatus = function (item, information) {
    logger.debug("meetingReminder.dbFunctions.insertConversationStatus()");

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
            else {
                logger.debug("[meetingReminder] Successfully inserted a " +
                        "status 1 into ConversationStatus");
                resolve();
            }
        });
    });
};


var existsConversationStatus = function (convId) {
    logger.debug("meetingReminder.dbFunction.existsConversationStatus( " + convId + " )");

    return new Promise(function (resolve, reject) {

        var query = "SELECT * FROM `ConversationStatus` " +
                "WHERE `active` = '1' AND `convId` = '" + convId + "'";
        logger.debug("[meetingReminder] existsConversationStatusQuery: " + query);

        dbConn.query(query, function (err, rows) {
            if (err) {
                logger.error("[meetingReminder] Error, while checking for existing " +
                        "ConversationStatus: " + err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};


var updateConversationStatusActive = function (status) {
    logger.debug("meetingReminder.dbFunctions.updateConversationStatus()");

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
            else {
                logger.debug("[meetingReminder]: Successfully updated " +
                        "the conversation status of " + status.convId);
                resolve();
            }
        });
    });
};

var selectToRemindMeetings = function () {
    logger.debug("meetingReminder.dbFunctions.selectToRemindMeetings()");

    // actual timestamp in UTC/GMT+0(london, europe)
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
            else {
                logger.info("[meetingReminder]" + rows.length +
                        " meetings will be updated");
                resolve(rows);
            }
        });
    });
};

var updateRemindMeetingsSentReminder = function (id) {
    logger.debug("meetingReminder.dbFunctions.updateRemindMeetingsSentReminder()");

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
                    logger.debug("[meetingReminder] sentReminder of ID " +
                            id + " was updated successfully.");
                }
            });
};

module.exports = {
    insertMeeting: insertMeeting,
    selectMeetingsOfConversation: selectMeetingsOfConversation,
    deleteMeetingById: deleteMeetingById,
    insertConversationStatus: insertConversationStatus,
    existsConversationStatus: existsConversationStatus,
    updateConversationStatusActive: updateConversationStatusActive,
    selectToRemindMeetings: selectToRemindMeetings,
    updateRemindMeetingsSentReminder: updateRemindMeetingsSentReminder
};



