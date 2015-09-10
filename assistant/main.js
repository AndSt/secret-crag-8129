var logger = require('./../utils/logger');
var comm = require('./communication');

var meetingReminder = require('./meetingReminder');
var textAnalyzer = require('./textAnalyzer');
var optionParser = require('./optionParser');


var registerEventListener = function (client) {

    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        logger.info('itemAdded ' + JSON.stringify(item));
        if (item.type === "TEXT"
                && item.creatorId !== client.loggedOnUser.userId)
        {
            parseItem(item)
                    .then(function (text) {
                        comm.sendTextItem(item.convId, text);
                    })
                    .catch(function (err) {
                        comm.sendTextItem(item.convId, err);
                    });
        }
    });
};


var parseItem = function (item, callback) {

    return new Promise(function (resolve, reject) {

        var text = item.text.content;

        if (text.indexOf('meeting assistant')> -1) {
            logger.info('The user speaks with the meeting assistant');
            optionParser.checkOptions(text).then(function (options) {
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

var sendToGA = function(item){
    var channel = {
        id:     item.convId
    };
    var user = {
        id:     item.userId
    };
 
    var msgText = item.text.content;
 
    //2 algorithms to count different things in the message text
    function searchM(regex){
        var searchStr = msgText.match(regex);
        if(searchStr !== null){
            return searchStr.length;
        }
        return 0;
    };
 
    function searchS(regex){
        var searchStr = msgText.split(regex);
        if(searchStr !== undefined){
            return searchStr.length;
        }
        return 0;
    };
 
    var wordCount = searchS(/\s+\b/);
    var exclaCount = searchM(/!/g);
    var questionMark = searchM(/\?/g);
    var elipseCount = searchM(/\.\.\./g);
 
    //The Structure Data! This is where are the pretty GA data gets gathered
    //before it is sent to the GA servers for us to analyse at a later time.
    var data = {
        v:      1,
        tid:    "UA-XXXXXXX-1", // <-- ADD UA NUMBER
        cid:    user.id,
        ds:     "slack", //data source
        cs:     "slack", // campaign source
        cd1:    user.id,
        cd2:    channel.id,
        cd3:    msgText,
        cm1:    wordCount,
        cm2:    exclaCount,
    //  note we’re skipping CM4
        cm5:    elipseCount,
        cm6:    questionMark, //need to set up in GA
        t:  "event",
        ec:     "slack: "+ channel.name + "|" + channel.id,
        ea:     "post by " + user.id,
        el:     msgText,
        ev:     1
    };
    console.log(JSON.stringify(data));
    console.log(req.body);
    //Now Make Post Request!
    request.post("https://www.google-analytics.com/collect?" + qs.stringify(data),
        function(error, resp, body){
        console.log(error);
    });
};

var update = function () {
    meetingReminder.update();
};
module.exports = {
    registerEventListener: registerEventListener,
    parseItem: parseItem,
    update: update
};