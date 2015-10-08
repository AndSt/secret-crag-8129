'use strict';

var config = require("./../../config.json");

var logger = require(config.loggerPath);
var comm = require(config.root + "/utils/communicator");
var chartToFile = require(config.root + "/utils/chartToFile");

var conversation = require("./conversation");
var dbFunctions = require("./dbFunctions");

var messages = require(config.root + "/files/messages.json");

var request = require('request');
var qs = require('querystring');

/***************************
 ***** text statistics ***** 
 * *************************
 * 
 * The statistics always consist of the following properties:
 * - number of messages
 * - number of words
 * - number of letters
 * - numer of question marks
 * - number of commata
 * - number of exclamation marks
 */

var start = function (options) {
    logger.debug("textStatistics.start( " + options.convId + " )");

    return new Promise(function (resolve, reject) {

        var promise = [];
        if (options.services.textStatistics.options.hasOwnProperty("days")) {
            promise.push(conversation.getConversationStatisticsPerUser(options.convId),
                    options.services.textStatistics.options.days);
        }
        else {
            promise.push(conversation.getConversationStatisticsPerUser(options.convId));
        }

        Promise.all(promise)
                .then(function (data) {
                    return chartToFile.renderAndSavePicture(data[0].user, 'numItems', config.root + "/files/pie" + options.convId + ".png");
                })
                .then(function (path) {
                    comm.sendTextItemWithFiles(options.convId, messages.textStatistics.text, [path], options.itemId);
                })
                .catch(function (err) {
                    reject(err);
                });

    });
};

var insertTextItemIntoDatabase = function (item) {
    logger.debug("addTextItemToDatabase( " + item.itemId + " )");

    item.text = item.text.replace("'", "''");

    return new Promise(function (resolve, reject) {
        dbFunctions.insertTextItemIntoDatabase(item)
                .then(function (val) {
                    resolve(item);
                }).catch(function (err) {
            reject(err);
        });
    });
};

var updateTextItem = function (item) {
    logger.debug("textStatistics.updateTextItem( " + item.itemId + " )");

    return new Promise(function (resolve, reject) {
        dbFunctions.updateTextItem(item)
                .then(function () {
                    resolve(item);
                }).catch(function (err) {
            reject(err);
        });
    });
};


var sendToGA = function (item) {
    logger.info("sendToGA( " + item.itemId + ")");

    return new Promise(function (resolve, reject) {

        var msgText = item.text;

        //2 algorithms to count different things in the message text
        var searchM = function (regex) {
            var searchStr = msgText.match(regex);
            if (searchStr !== null) {
                return searchStr.length;
            }
            return 0;
        };

        var searchS = function (regex) {
            var searchStr = msgText.split(regex);
            if (searchStr !== undefined) {
                return searchStr.length;
            }
            return 0;
        };


        var information = {
            userId: item.creatorId,
            convId: item.convId,
            msgText: item.text,
            wordCount: searchS(/\s+\b/),
            exclaCount: searchM(/!/g),
            questionCount: searchM(/\?/g),
            letterCount: item.text.length
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
                    logger.info(JSON.stringify(body));
                    resolve(item);
                });
    });
};



module.exports = {
    start: start,
    insertTextItemIntoDatabase: insertTextItemIntoDatabase,
    updateTextItem: updateTextItem,
    sendToGA: sendToGA
};