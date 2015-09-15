var mysql = require('mysql');
var logger = require('./../utils/logger');
var dbConn = require('./../utils/database').getConnection();
var comm = require('./../utils/communication');

var request = require('request');
var qs = require('querystring');

var meetingReminder = require('./meetingReminder/meetingReminder');
var textAnalyzer = require('./textAnalyzer');
var optionParser = require('./optionParser');



var registerEventListener = function (client) {
    logger.debug("registerEventListener()");

    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        logger.info('[eventListener] itemAdded' + JSON.stringify(item));

        /*
         * Three options:
         * ** react on text items
         * ** react on rtc event items
         * ** default
         */

        if (item.type === "TEXT") {
            /*
             * add text item to database for statics
             * -> then check if a conversation status is set and the assistant
             *      waits for an answer
             * -> then call parseItem() to parse options and process them 
             */
            addTextItemToDatabase(item).then(function () {
                if (item.creatorId !== 'f6ce8cc5-e094-4ffa-9551-52192eca9cc4') {

                    checkConversationStatus(item).then(function (options) {
                        logger.debug("hier");
                        if (options.useOptionParser === true) {
                            parseItem(item)
                                    .then(function (text) {
                                    })
                                    .catch(function (err) {
                                        comm.sendTextItem(item.convId,
                                                "Das ist scheisse");
                                    });
                        }
                        else {
                            logger.debug("[main] no answer shall be given");
                        }
                    }).catch(function (err) {
                    });
                }
            });
        }
        else if (item.type === "RTC" && item.rtc.type === "ENDED") {

            logger.info("RTCInfo " + JSON.stringify(item));
            meetingReminder.askForRepetition(item);
        }
        else {
            logger.info("ITEM: " + JSON.stringify(item));
        }
    });
};


var checkConversationStatus = function (item) {
    logger.debug("checkConversationStatus( " + item.convId + " )");

    return new Promise(function (resolve, reject) {

        var query = "SELECT * FROM \`ConversationStatus\` " +
                "WHERE \`convId\`=\'" + item.convId + "\' " +
                "AND \`active\`=\'1\'";
        logger.debug("[main] checkConversationStatusQuery: " + query);


        dbConn.query(query, function (err, rows, fields) {
            if (err) {
                logger.error("[main] Error while selecting " +
                        "ConversationStatus: " + err);
                reject("Error while selecting ConversationStatus");
            } else if (rows.length > 1) {
                logger.error("[main] too much conversation statuses set");
                reject("Too much statuses for conversation " + item.convId);
            } else if (rows.length === 0) {
                logger.debug("[main] No status set for the conversation");
                resolve({useOptionParser: true});
            }
            else {

                logger.info("rows of convStatus: " + JSON.stringify(rows));
                switch (rows[0].status) {
                    case '1' :
                        resolve(meetingReminder.processRepetitionAnswer(item,
                                rows[0]));
                        break;
                    default:
                        logger.error("[main]: Wrong data in the database, " +
                                "as the conversation status is not set");
                        reject("wrong conversation status");
                }
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
                logger.info("[main]Successfully added a text item to database.");
                resolve();
            }
        });

    });
};

var sendToGA = function (item) {
    logger.info("sendToGA( " + item.itemId + ")");

    return new Promise(function (resolve, reject) {

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

        var information = {
            userId: item.creatorId,
            convId: item.convId,
            msgText: item.text.content,
            wordCount: searchS(/\s+\b/),
            exclaCount: searchM(/!/g),
            questionCount: searchM(/\?/g),
            letterCount: msgText.length
        };
        //The Structure Data! This is where are the pretty GA data gets gathered
        //before it is sent to the GA servers for us to analyse at a later time.
        var data = {
            v: 1,
            tid: "UA-41507980-3", // <-- ADD UA NUMBER
            cid: 'f7287266-12ee-41b8-8ca8-f9f9691eee01',
            t: "event",
            cd1: information.userId,
            cd2: information.convId,
            cm1: information.wordCount,
            cm2: information.letterCount,
            cm3: information.exclaCount,
            cm4: information.questionCount, //need to set up in GA
            an: "meetingAssisant",
            ec: "circuit: " + information.convId,
            ea: "post by " + information.userId,
            el: msgText,
            ev: 1
        };

        logger.info("[main] Sending to GA: " + JSON.stringify(data));

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