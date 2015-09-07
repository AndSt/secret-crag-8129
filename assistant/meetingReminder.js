
var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var comm = require('./communication');


var addMeeting = function (item, partials, callback) {
    var now = Math.floor((new Date()).getTime() / 1000);

    var dat = partials[2].split(" ");
    var dat2 = dat[0].split(".");
    var date = new Date(dat2[1] + "." + dat2[0] + "." + dat2[2] + " " + dat[1]);
    var unixDate = Math.floor(date.getTime() / 1000);
    var reminderDate = unixDate - 300;

    var title = typeof partials[3] === 'undefined' ? "" : partials[3];
    var sentReminder = 0;
    if (now >= unixDate - 20) {
        sentReminder = 1;
    }

    connection.query(
            "INSERT INTO `remindMeetings`(`convId`, `inputItemId`, " +
            "`inputText`, `title`, `date`, `reminderDate`, `sentReminder`) " +
            "VALUES ('" + item.convId + "', '" + item.itemId + "', '" +
            item.text.content + "', '" + title + "', '" + unixDate +
            "', " + reminderDate + ", " + sentReminder + ")",
            function (err) {
                if (err) {
                    logger.error("[meetingReminder] Error while inserting " +
                            +"a remindMeeting");
                    callback(false, "Error while inserting a remindMeeting. " +
                            "Please try again.");
                }
                else {
                    logger.info("[meetingReminder] Inserting of remindMeeting " +
                            "went well");
                    callback(false, "Inserting of remindMeeting went well");
                }
            });
};

var update = function () {

    // actual timestamp in UTC/GMT+2(berlin, germany)
    var now = Math.floor((new Date()).getTime() / 1000) + 7200;

    // choose every meeting, which has an expired reminderDate
    connection.query("SELECT * FROM  `remindMeetings` " +
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
                        dateString = date.getUTCHours() + ":" + date.getUTCMinutes();
                        id = meeting.ID;
                        // send text
                        if (meeting.title === "") {
                            comm.sendTextItem(meeting.convId,
                                    "Um " + dateString + " Uhr beginnt " +
                                    "ein Meeting."
                                    );
                        }
                        else {
                            comm.sendTextItem(meeting.convId,
                                    "Um " + dateString + " Uhr beginnt " +
                                    "das Meeting " + meeting.title
                                    );
                        }


                        // update the sentReminder flag
                        connection.query("UPDATE `remindMeetings` " +
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