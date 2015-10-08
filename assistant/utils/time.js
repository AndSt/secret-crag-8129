
var config = require('./../config.json');

var parsingOptions = require(config.root + "/files/parsingOptions.json");

var moment = require('moment-timezone');
moment.tz.setDefault("Etc/GMT+0");

var logger = require(config.loggerPath);


var searchDate = function (text) {
    logger.debug("searchDate( " + text + " )");

    var dateRegExp = new RegExp(/((0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4})|(\d{4}[\/\-\.](0?[1-9]|1[012])[\/\-\.](0?[1-9]|[12][0-9]|3[01]))/g);
    var timeRegExp = new RegExp(/([01]\d|2[0-3]):([0-5]\d)/g);


    var texts = [{
            regExp: /next\sweek/ig,
            add: "7"
        },
        {
            regExp: /tomorrow/ig,
            add: "1"
        },
        {
            regExp: /today/ig,
            add: "0"
        },
        {
            regExp: /the\sday\safter\stomorrow/,
            add: "2"
        },
        {
            regExp: /in\s[1-9][0-9]?\sdays/ig
        },
        {
            regExp: /in\s[1-9][0-9]?\sweeks/ig
        },
        {
            regExp: /in\s[1-9][1-9]?[1-9]?\sminutes/ig
        }
    ];

    var match = {id: 0, text: "", numMatches: 0};
    for (var i = 0; i < texts.length; i++) {
        if (texts[i].regExp.test(text) === true) {
            match.numMatches++;
            match.text = text.match(texts[i].regExp);
            match.id = i;
        }
    }

    if (match.numMatches > 1) {
        logger.error("Too much date information found");
        return false;
    }
    else if (match.numMatches === 1) {

        var timeStr = text.match(timeRegExp);
        var date = moment(timeStr, ["HH:mm"]);

        if (texts[match.id].hasOwnProperty("add")) {
            date.add(texts[match.id].add, 'd');
            return date.toJSON();
        }
        else {
            var split = match.text[0].split(" ");
            if (split[2] === "days") {
                date.add(parseInt(split[1]), 'd');
            }
            else if (split[2] === "weeks") {
                date.add(parseInt(split[1]) * 7, 'd');
            }

            return date.toJSON();
        }
    }
    else {

        if (dateRegExp.test(text) === true && timeRegExp.test(text) === true) {

            var dateStr = text.match(dateRegExp);
            var timeStr = text.match(timeRegExp);

            var dateTime = moment(dateStr + " " + timeStr, parsingOptions.time.formats);
            return dateTime.toJSON();
        }
        else {
            logger.error("No valid date/time could be found in the string" + text);
            return false;
        }
    }
};

var getUnixTimeStamp = function (date) {

    var mom;
    if (date === undefined) {
        logger.debug('getUnixTimeStamp()');
        mom = moment();
    }
    else {
        logger.debug('getUnixTimeStamp(' + date + ')');
        mom = moment(date);
    }

    return mom.unix();
};

var getUserOutputDate = function (date) {
    logger.debug('getUserOutputDate(' + date + ")");

    var mom = moment(date * 1000);
    var ret = mom.format('dddd, D MMMM YYYY HH:mm');
    logger.debug('The output date is: ' + ret);
    return ret;
};

var getJSDate = function (date) {
    logger.debug('getNodeDate( ' + date + ' )');

    var mom = moment(date * 1000);
    var ret = mom.toDate();
    logger.debug('The js date is: ' + ret);
    return ret;
};


/*
 * 
 */
var addMinutes = function (date, minutes) {
    logger.debug('addMinutes( ' + date + ' )');

    var mom = moment(date * 1000);
    var ret = mom.add(minutes, 'm');
    logger.debug('The new date is: ' + getUserOutputDate);
    return ret;
};

module.exports = {
    searchDate: searchDate,
    getUnixTimeStamp: getUnixTimeStamp,
    getUserOutputDate: getUserOutputDate,
    getJSDate: getJSDate,
    addMinutes: addMinutes
};