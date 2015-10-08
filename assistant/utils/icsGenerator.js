
var config = require('./../config.json');

var ical = require('ical-generator');

var logger = require(config.loggerPath);
var time = require('./time');
var comm = require('./communicator');


var generateIcsForMeeting = function (convId, creatorId, date, duration) {
    logger.debug("generateIcsForMeeting( " + convId + " )");

    return new Promise(function (resolve, reject) {

        comm.getConversation(convId)
                .then(function (conv) {

                    var cal = ical();
            
                    cal.timezone('Europe/London');

                    var summary, description;
                    if (conv.topic) {
                        summary = "Circuit meeting with title " +
                                conv.topic;
                    }
                    else {
                        summary = "Circuit meeting at https://circuitsandbox.net/#/conversation/" +
                                convId;
                    }
                    if (conv.description) {
                        description = "The conversation has the following " +
                                "description: " + conv.description + "\n";
                    }
                    else {
                        description = '';
                    }
                    description += "The meeting will be at: https://circuitsandbox.net/#/conversation/" +
                                convId;

                    var event = cal.createEvent({
                        start: time.getJSDate(date),
                        end: time.getJSDate(time.addMinutes(date, duration)),
                        timestamp: time.getJSDate(time.getUnixTimeStamp()),
                        summary: summary,
                        description: description,
                        url: 'https://circuitsandbox.net/#/conversation/' +
                                convId,
                        location: "Circuit"
                    });

                    comm.getUsersById(conv.participants).then(function (users) {
                        users.forEach(function (user) {
                            if (user.userId !== creatorId) {
                                event.createAttendee({name: user.displayName, email: user.emailAddress});
                            }
                            else {
                                event.organizer({name: user.displayName, email: user.emailAddress});
                            }
                        });

                        event.createAlarm({
                            type: 'display',
                            trigger: 300,
                            description: 'Circuit meeting reminder'
                        });


                        logger.info('Cal created tis calendar: ' + cal.toString());
                        var path = config.root + '/files/meeting' + date + '.ics';

                        cal.save(path,
                                function (err) {
                                    if (err) {
                                        logger.info("Saving went not well");
                                        reject(err);
                                    }
                                    else {
                                        logger.info("Saving went well");
                                        resolve(path);
                                    }
                                });
                    }).catch(function (err) {
                        reject(err);
                    });
                }).catch(function (err) {
            reject(err);
        });
    });
};


module.exports = {
    generateIcsForMeeting: generateIcsForMeeting
};