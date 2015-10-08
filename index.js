'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Circuit = require('circuit');
var assistant = require('./assistant/main');
var logger = require('./utils/logger');
var client = require('./utils/client').getClient();

var statistics = require('./assistant/services/textStatistics/main');

var statisticsRoutes = require("./routes/statistics");
var getStatsRoutes = require('./routes/getStats');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/', statisticsRoutes);
app.use('/getStats', getStatsRoutes);


app.get('/', function (request, response) {
    response.render('pages/index');
});

app.get('/commandGeneratior', function (req, res) {
    res.render('pages/commandGenerator');
});

app.get('/test2', function (req, res) {
    statistics.getTrackedUsers()
            .then(function (convs) {
                res.json(convs);
            })
            .catch(function (err) {
                res.send("Error!");
            });
});

app.get('/help', function (req, res) {
    res.render('pages/help');
});


app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


//assistant.registerEventListener(client);

client.addEventListener('itemAdded', function (event) {

    if (event.item.creatorId !== client.loggedOnUser.userId) {
        if (event.item.type === 'TEXT') {

            var textItem = {
                itemId: event.item.itemId,
                convId: event.item.convId,
                type: event.item.text.type,
                text: event.item.text.content,
                creatorId: event.item.creatorId,
                creationTime: event.item.creationTime,
                modificationTime: event.item.modificationTime
            };

            assistant.textItemAddedEvent(textItem);
        }
        else if (event.item.type === 'RTC') {
            console.log("RTCRTCRTCRTCRTC");
            console.log(JSON.stringify(event));
            var rtcItem = {
                itemId: event.item.itemId,
                convId: event.item.convId,
                type: event.item.rtc.type,
                ended: {
                    duration: event.item.rtc.ended.duration
                },
                participants: event.item.rtc.rtcParticipants,
                creatorId: event.item.creatorId,
                creationTime: event.item.creationTime,
                modificationTime: event.item.modificationTime
            };

            assistant.conferenceFinishedEvent(rtcItem);
        }
        else if (event.item.type === 'CONVERSATION') {
            logger.debug(JSON.stringify(event));
        }
        else if (event.item.type === 'USER') {
            logger.debug(JSON.stringify(event));
        }
        else {
            console.log("Nothing TODO, wrong itemType");
        }
    }
});

client.addEventListener('itemUpdated', function (event) {

    console.log(JSON.stringify(event));

    if (event.item.type === "TEXT") {

        var textItem = {
            itemId: event.item.itemId,
            convId: event.item.convId,
            type: event.item.text.type,
            text: event.item.text.content,
            creatorId: event.item.creatorId,
            creationTime: event.item.creationTime,
            modificationTime: event.item.modificationTime
        };

        assistant.textItemUpdatedEvent(textItem);

    }
    else {

    }
});

client.addEventListener('userPresenceChanged', function (event) {

    logger.debug(JSON.stringify(event));
});

client.addEventListener('RTC_SESSION', function (event) {
    logger.debug(JSON.stringify(event));
});

//client.addEventListener('conversationCreated', function (event) {
//    logger.debug("conversationCreated: " + JSON.stringify(event));
//    assistant.addedToConversationEvent(event.conversation);
//});

global.setInterval(assistant.update, 60000);


