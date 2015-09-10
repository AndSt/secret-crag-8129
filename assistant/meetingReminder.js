
var mysql = require('mysql');
var dbConn = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var time = require('./../utils/time');
var comm = require('./communication');

/*
 * adds a new meeting to the table remindMeetings
 * 
 * @param item      the item to add
 * @param partials  array of strings containing information
 *      partials[2] - date, when the meeting will take place
 *      partials[3] - title of the meeting
 * @param callback  callback function with parameters
 *          err - if true nothing will be answered to the user
 *          val - string, which will be sent to the user
 */
var addMeeting = function (item, options) {
    return new Promise(function (resolve, reject) {
        logger.info('meeting will be added' + JSON.stringify(options));

        var unixDate = time.getUnixTimeStamp(options.date);
        var reminderDate = unixDate - 300;
        var sentReminder = 0;
        if (time.getUnixTimeStamp(new Date()) >= unixDate - 20) {
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

    // actual timestamp in UTC/GMT+2(berlin, germany)
    var now = Math.floor((new Date()).getTime() / 1000) + 7200;

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
                    logger.info("check started at  " + now +
                            "and " + rows.length + " meetings will " +
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