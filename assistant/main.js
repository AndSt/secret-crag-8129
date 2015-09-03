
var mysql = require('mysql');
var connection = require('./../database').getConnection();


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

exports.checkItem = function (text, callback) {
    var partials = text.split("/");
    switch (partials[1]) {
        case "addMeetingDate":
            addMeeting(conn, text, partials, function (err, val) {
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

exports.addMeeting = function (text, partials, callback) {
    var now = Math.floor((new Date()).getTime() / 1000);

    var dat = partials[2].split(" ");
    var dat2 = dat[0].split(".");
    var date = new Date(dat2[1] + "." + dat2[0] + "." + dat2[2] + " " + dat[1]);
    var unixDate = Math.floor(date.getTime() / 1000);
    var reminderDate = unixDate - 300;

    var title = typeof partials[3] === 'undefined' ? "" : partials[3];
    var sentReminder = 0;
    if (now >= reminderDate) {
        sentReminder = 1;
    }
    
    callback(false, "passt alles");
    
//    connection.query(
//            "INSERT INTO `remindMeetings`(`convID`, `inputItemID`, " +
//            "`inputText`, `title`, `date`, `reminderDate`, `sentReminder`) " +
//            "VALUES ('1', '1', '" + text + "', '" + title + "', '" +
//            unixDate + "', " + reminderDate + ", " + sentReminder + ")",
//            function (err) {
//                if (err) {
//                    console.error("Error while inserting a remindMeeting");
//                    callback(true, "Error while inserting a remindMeeting");
//                }
//                else {
//                    callback(false, "Inserting of remindMeeting went well");
//                }
//            });
};
