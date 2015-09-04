var meetingReminder = require('./meetingReminder');


var checkItem = function (text, callback) {
    var partials = text.split("/");
    switch (partials[1]) {
        case "addMeetingDate":
            meetingReminder.addMeeting(text, partials, function (err, val) {
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

var update = function(){
    meetingReminder.update();
};

module.exports = {
   checkItem : checkItem,
   update : update
};