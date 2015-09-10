var moment = require('moment');
moment().utc().format();
var logger = require('./logger');


var searchDate = function (text) {
    logger.info("searchDate( " + text + " )");
    return new Promise(function (resolve, reject) {

        var dateRegExp = new RegExp(/((0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4})|(\d{4}[\/\-\.](0?[1-9]|1[012])[\/\-\.](0?[1-9]|[12][0-9]|3[01]))/g);
        var timeRegExp = new RegExp(/([01]\d|2[0-3]):([0-5]\d)/g);

        if (dateRegExp.test(text) === true && timeRegExp.test(text) === true) {

            var dateStr = text.match(dateRegExp);
            var timeStr = text.match(timeRegExp);

            var dateTime = moment(dateStr + " " + timeStr, [
                "MM-DD-YYYY HH:mm",
                "YYYY-MM-DD HH:mm",
                "MM.DD.YYYY HH:mm",
                "YYYY.MM.DD HH:mm",
                "MM/DD/YYYY HH:mm",
                "YYYY/MM/DD HH:mm"
            ]);
            dateTime.add(moment().utcOffset(), 'minutes');
            logger.info("The date " + dateTime.toJSON() + " was recognized");
            resolve(dateTime.toJSON());
        }
        else {
            logger.error("No valid date/time could be found in the string" + text);
            reject("No valid date/time could be found in the string");
        }

    });
};

var getUnixTimeStamp = function (date) {
    logger.info('getUnixTimeStamp()' + date);

    var mom;
    if (date === undefined) {
        mom = moment();
    }
    else {
        mom = moment(date);
    }

    return mom.unix();
};

module.exports = {
    searchDate: searchDate,
    getUnixTimeStamp: getUnixTimeStamp
};