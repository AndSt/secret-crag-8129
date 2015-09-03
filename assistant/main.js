
var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');


exports.test = function (callback) {
    connection.query("SELECT * FROM remindMeetings", function (err, rows) {
        if (err) {
            callback(false, "Error querying database");
        }
        else {
            callback(false, "Querrying database went great")
        }
    });
};

var addMeeting = function (text, partials, callback) {
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
            "INSERT INTO `remindMeetings`(`convID`, `inputItemID`, " +
            "`inputText`, `title`, `date`, `reminderDate`, `sentReminder`) " +
            "VALUES ('1', '1', '" + text + "', '" + title + "', '" +
            unixDate + "', " + reminderDate + ", " + sentReminder + ")",
            function (err) {
                if (err) {
                    logger.log("Error while inserting a remindMeeting",
                            "ERROR");
                    callback(true, "Error while inserting a remindMeeting");
                }
                else {
                    logger.log("Inserting of remindMeeting went well",
                            "INFO");
                    callback(false, "Inserting of remindMeeting went well");
                }
            });
};


var checkItem = function (text, callback) {
    var partials = text.split("/");
    switch (partials[1]) {
        case "addMeetingDate":
            addMeeting(text, partials, function (err, val) {
                if (err) {
                    callback(err, val);
                }
                else {
                    callback(err, val);
                }
            });
            break;
        default:
            callback(true, "item");
    }
};

var updateFunction = function () {

    var now = Math.floor((new Date()).getTime() / 1000) + 7200;
    // every 10 seconds there is a check, if a meeting is starting soon
    // if yes, a reminder will be posted to circuit

    connection.query("SELECT * FROM  `remindMeetings` " +
            "WHERE  `sentReminder` =  '0' " +
            " AND  `reminderDate` <  '" + now + "'",
            function (err, rows) {
                if (err) {
                    logger.log("Error while getting the meeting to remind",
                            "ERROR");
                }
                else {
                    logger.log("check started at  " + now +
                            "and " + rows.length + " meetings will " +
                            "be sent", "INFO");
                    var meeting, date;
                    for (var i = 0; i < rows.length; i++) {

                        //send reminder messages
                        meeting = rows[i];
                        date = new Date(meeting.date);

                        // send text
                        if (meeting.title === "") {
                            logger.log(
                                    "Die nächste Besprechung findet bald statt. \n" +
                                    "Der genaue Uhrzeit ist " + date + ".",
                                    "INFO"
                                    );
                        }
                        else {
                            logger.log(
                                    "Die Besprechung " + meeting.title +
                                    " findet in 5 Minuten statt. \n" +
                                    "Die genau Uhrzeit ist: " + date + ".",
                                    "INFO"
                                    );
                        }
                        // update the sentReminder flag
                        connection.query("UPDATE `remindMeetings` " +
                                "SET `sentReminder`='1' " +
                                "WHERE `ID` = '" + meeting.ID + "'",
                                function (err) {
                                    if (err) {
                                        logger.log("sentReminder von ID " +
                                                meeting.ID + " konnte nicht " +
                                                "geupdated werden.",
                                                "ERROR");
                                    }
                                    else {
                                        logger.log("sentReminder von ID " +
                                                meeting.ID + " wurde erfolgreich " +
                                                "geupdated.",
                                                "INFO");
                                    }
                                });
                    }
                }
            });
};


module.exports = {
    addMeeting: addMeeting,
    checkItem: checkItem,
    updateFunction: updateFunction
};