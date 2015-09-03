var connection = require ('db');

var exports = module.exports = {};

exports.checkItem = function (conn, text, callback) {
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

exports.addMeeting = function (conn, text, partials, callback) {
    
    conn.query("SELECT * FROM remindMeetings", function(err, rows){
        if(err) {
            callback(true, "Error querying database");
        }
        else {
            callback(true, "Querrying database went great");
        }
    });
    
    
//    jsonfile.readFile(config.meetingFile, function (err, file) {
//        if (err) {
//            callback(true, "Error reading file");
//        }
//        else {
//
//            // Date has format dd:mm:jjjj mm:ss
//            // Therefore we reorder days and months(switch them):
//            var dat = partials[2].split(" ");
//            var dat2 = dat[0].split(".");
//            var date = new Date(dat2[1] + "." + dat2[0] + "." + dat2[2] + " " + dat[1]);
//            var unixDate = Math.floor(date.getTime() / 1000);
//            var title = typeof partials[3] === 'undefined' ? "" : partials[3];
//
//            var meeting = {
//                meeting: {
//                    "text": text,
//                    "title": title,
//                    "date": unixDate,
//                    "reminderDate": (unixDate - 300),
//                    "sentReminder": false
//                }
//            };
//            file.meetings.push(meeting);
//            jsonfile.writeFile(config.meetingFile, file, function (err) {
//                if (err) {
//                    callback(true, "Error writing file");
//                }
//                else {
//                    callback(false, file);
//                }
//            });
//        }
//    });
};
