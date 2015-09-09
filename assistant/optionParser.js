
var logger = require('./../utils/logger');
var time = require('./../utils/time');

var checkOptions = function (text) {
    return new Promise(function (resolve, reject) {
        var options = {
            remindMeeting: {},
            textStatistics: {
                isInUse: false,
                convId: '',
                sendPdf: true,
                giveInternetLink: true
            },
            searchAndWrite: {
                isInUse: false,
                convId: '',
                searchText: '',
                numberOfItems: 0,
                date: ''
            }
        };

        testMeetingReminder(text)
                .then(function (remindMeeting) {
                    options.remindMeeting = remindMeeting;
                    resolve(options);
                })
                .catch(function (err) {
                    logger.error(err);
                    reject(err);
                });

    });
};

var testMeetingReminder = function (text) {
    return new Promise(function (resolve, reject) {
        var regex = new RegExp(/^meeting\sassistant.*(new\smeeting|add\smeeting|next\smeeting|next\ssession|remind).*$/);
        //((hello|hi|yo)\s)?

        var meetingReminder;
        if (regex.test(text.toLowerCase()) === true) {
            time.searchDate(text)
                    .then(function (date) {
                        meetingReminder = {
                            isInUse: true,
                            writtenOptionsWrong: false,
                            date: date,
                            remindEarlier: 300
                        };
                        resolve(meetingReminder);
                    })
                    .catch(function (err) {
                        meetingReminder = {
                            isInUse: false,
                            writtenOptionsWrong: true,
                            sorryText: "We could not find a valid date/time " +
                                    "in your request."
                        };
                        resolve(meetingReminder);
                    });
        }
        else {
            meetingReminder = {
                isInUse: false,
                writtenOptionsWrong: false
            };
            resolve(meetingReminder);
        }
    });
};

var testTextStatistics = function (text) {

};

var testSearchAndWrite = function (text) {

};


module.exports = {
    checkOptions: checkOptions,
    testMeetingReminder: testMeetingReminder,
    testTextStatistics: testTextStatistics,
    testSearchAndWrite: testSearchAndWrite
};

