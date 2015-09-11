
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
    logger.info("meetingReminder.addMeeting( " + item.itemId + " ) with " +
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

        logger.info("Query: " + query);
        
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


/*
 * the update function checks, if any remindings have to be sent.
 * Then it sends the remindings and updates the database
 */
var update = function () {
    logger.info('meetingReminder.update()');

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
                    logger.info("check started at " + now +
                            " and " + rows.length + " meetings will " +
                            "be sent");
                    var meeting, date, id;
                    for (var i = 0; i < rows.length; i++) {

                        //send reminder messages
                        meeting = rows[i];
                        date = new Date(meeting.date);
                        dateString = date.getHours() + ":" + date.getMinutes();
                        id = meeting.ID;
                        // send text
                        comm.sendTextItem(meeting.convId,
                                "Um " + dateString + " Uhr beginnt " +
                                "das Meeting " + meeting.title
                                );

                        // update the sentReminder flag
                        dbConn.query("UPDATE `remindMeetings` " +
                                "SET `sentReminder`='1' " +
                                "WHERE `ID` = '" + id + "'",
                                function (err) {
                                    if (err) {
                                        logger.error("sentReminder of ID " +
                                                id + " couldn't be updated ," +
                                                "because: " + err);
                                    }
                                    else {
                                        logger.info("sentReminder of ID " +
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
    update: update
};