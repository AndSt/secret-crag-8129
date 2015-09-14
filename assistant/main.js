var mysql = require('mysql');
var logger = require('./../utils/logger');
var dbConn = require('./../utils/database').getConnection();
var comm = require('./communication');

var request = require('request');
var qs = require('querystring');


var meetingReminder = require('./meetingReminder');
var textAnalyzer = require('./textAnalyzer');
var optionParser = require('./optionParser');


var registerEventListener = function (client) {
    logger.debug("registerEventListener()");

    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        logger.info('[eventListener] itemAdded' + JSON.stringify(item));

        if (item.type === "TEXT") {

            addTextItemToDatabase(item).then(function () {
                if (item.creatorId !== client.loggedOnUser.userId) {

                    checkConversationStatus(item).then(function (options) {
                        if (options.useOptionParser === true) {
                            parseItem(item)
                                    .then(function (text) {
                                        comm.sendTextItem(item.convId, text);
                                    })
                                    .catch(function (err) {
                                        comm.sendTextItem(item.convId, "Das ist scheisse");
                                    });
                        }
                    }).catch(function (err) {
                    });
                }
            });
        }
        else if (item.type === "RTC" && item.rtc.type === "ENDED") {

            logger.info("RTCInfo " + JSON.stringify(item));
            meetingReminder.askForRepetition(item)
                    .then(function (text) {
                    })
                    .catch(function (err) {
                        comm.sendTextItem(item.convId, "ERROR: " + err);
                    });

        }
        else {
            logger.info("ITEM: " + JSON.stringify(item));
        }
    });
};



var checkConversationStatus = function (item) {
    logger.debug("checkConversationStatus( " + item.convId + " )");

    return new Promise(function (resolve, reject) {

        var query = "SELECT * FROM `ConversationStatus` " +
                "WHERE `convId`='" + item.convId + "' AND `active`='1'";
        logger.debug("[main] checkConversationStatusQuery: " + escape(query));

        dbConn.query(query, function (err, rows, fields) {
            if (err) {
                logger.error("[main] Error while selecting " +
                        "ConversationStatus: " + err);
                reject("Error while selecting ConversationStatus");
            }

            if (rows.length > 1) {
                reject("Too much statuses for conversation " + item.convId);
            }
            else if (rows.length === 0) {
                logger.debug("No status set for the conversation");
                resolve({useOptionParser: true});
            }
            logger.info("rows of convStatus: " + JSON.stringify(rows));
            switch (rows[0]) {
                case 1 :
                    resolve(meetingReminder.processRepetitionAnswer(item));
                    break;
                default:
                    resolve({useOptionParser: true});
            }
        });
    });
};


var parseItem = function (item) {
    logger.debug("parseItem( " + item.itemId + " )");
    return new Promise(function (resolve, reject) {

        var text = item.text.content;

        if (text.indexOf('meeting assistant') > -1) {
            logger.debug('[parser] The user speaks with the ' +
                    'meeting assistant');
            optionParser.parseOptions(text).then(function (options) {
                if (options.remindMeeting.isInUse === true) {
                    resolve(meetingReminder.addMeeting(item, options.remindMeeting));
                }
                else if (options.textAnalyzer.isInUse === true) {
                    resolve(textAnalyzer.analyzeConversation(item, options));
                }
                else {
                    reject("The assistent must not answer");
                }
            });
        }
        else {
            reject("The assistent must not answer");
        }

    });
};


var addTextItemToDatabase = function (item) {
    logger.debug("addTextItemToDatabase( " + item.itemId + " )");
    return new Promise(function (resolve, reject) {

        var query = "INSERT INTO \`Items\`(\`itemId\`, \`convId\`, \`creatorId\`, " +
                " \`text\`) VALUES (\'" + item.itemId + "\', \'" + item.convId +
                "\', \'" + item.creatorId + "\', \'" + item.text.content + "\')";

        logger.debug("Query to add new item to database: " + query);

        dbConn.query(query, function (err) {
            if (err) {
                logger.error(err);
                reject("Adding a text item to the database failed");
            }
            else {
                logger.info("Successfully added a text item to database.");
                resolve();
            }
        });

    });
};

var sendToGA = function (item) {
    return new Promise(function (resolve, reject) {

        logger.info("sendToGA()");
        var channel = {
            id: item.convId
        };
        var user = {
            id: item.creatorId
        };

        var msgText = item.text.content;

        //2 algorithms to count different things in the message text
        function searchM(regex) {
            var searchStr = msgText.match(regex);
            if (searchStr !== null) {
                return searchStr.length;
            }
            return 0;
        }
        ;

        function searchS(regex) {
            var searchStr = msgText.split(regex);
            if (searchStr !== undefined) {
                return searchStr.length;
            }
            return 0;
        }
        ;

        var wordCount = searchS(/\s+\b/);
        var exclaCount = searchM(/!/g);
        var questionCount = searchM(/\?/g);
        var letterCount = msgText.length;
        //The Structure Data! This is where are the pretty GA data gets gathered
        //before it is sent to the GA servers for us to analyse at a later time.
        var data = {
            v: 1,
            tid: "UA-41507980-2", // <-- ADD UA NUMBER
            cid: 'f7287266-12ee-41b8-8ca8-f9f9691eee01',
            t: "event",
            cd1: user.id,
            cd2: channel.id,
            cd3: msgText,
            cm1: wordCount,
            cm2: letterCount,
            cm3: exclaCount,
            cm4: questionCount, //need to set up in GA
            an: "meetingAssisant"
        };
        logger.info("hier");
        logger.info("https://www.google-analytics.com/collect?" + qs.stringify(data));
        request.post("https://www.google-analytics.com/collect?" + qs.stringify(data),
                function (error, resp, body) {
                    logger.error(JSON.stringify(error));
                    logger.info(JSON.stringify(resp));
                    logger.ino(JSON.stringify(body));
                });
        resolve(item);
    });
};

var update = function () {
    logger.info("main.update()");
    meetingReminder.update();
};


module.exports = {
    registerEventListener: registerEventListener,
    parseItem: parseItem,
    checkConversationStatus: checkConversationStatus,
    sendToGA: sendToGA,
    update: update
};