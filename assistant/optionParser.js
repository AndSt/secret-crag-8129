
var logger = require('./../utils/logger');
var time = require('./../utils/time');

/*
 * fills the options object
 * 
 * @param {string} text     text, which shall be passed
 * @returns {Promise}       options object or err string
 */
var parseOptions = function (text) {
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
                    logger.info("Options are rendered: " + JSON.stringify(options));
                    resolve(options);
                })
                .catch(function (err) {
                    logger.error(err);
                    reject(err);
                });
    });
};

 /* checks if the meeting reminder functionality shall be used
 * 
 * @param text  will be checked against regular expressions
 */
var testMeetingReminder = function (text) {
    logger.info("testMeetingReminer( " + text + " )");
    return new Promise(function (resolve, reject) {
        
        var regex = new RegExp(/^.*(new\smeeting|add\smeeting|next\smeeting|next\ssession|remind).*$/);
        

        var meetingReminder;
        if (regex.test(text.toLowerCase()) === true) {
            logger.info("meetingReminder functionality shall be used");
            
            //checks, if text contains correct date and returns it in ISO 8601
            time.searchDate(text)
                    .then(function (date) {
                        meetingReminder = {
                            isInUse: true,
                            writtenOptionsWrong: false,
                            date: date,
                            remindEarlier: 300
                        };
                        logger.info("meetingReminder is in use");
                        resolve(meetingReminder);
                    })
                    .catch(function (err) {
                        meetingReminder = {
                            isInUse: false,
                            writtenOptionsWrong: true,
                            sorryText: err
                        };
                        logger.info("meetingReminder shall be used, but no" +
                                "correct time format was found");
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
    parseOptions: parseOptions,
    testMeetingReminder: testMeetingReminder,
    testTextStatistics: testTextStatistics,
    testSearchAndWrite: testSearchAndWrite
};

