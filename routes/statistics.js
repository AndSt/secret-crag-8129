'use strict';

var express = require('express');
var router = express.Router();

var convTextStats = require("./../assistant/services/textStatistics/conversation")
var userTextStats = require("./../assistant/services/textStatistics/user");
var textStatistics = require("./../assistant/services/textStatistics/main");

var sampleData = require("./../assistant/services/callStatistics/sampleData");

var chartToFile = require("./../assistant/utils/chartToFile");

router.get('/', function (req, res) {
    var promises = [];

    Promise.all(promises)
            .then(function (dataArr) {
                console.log("INNN: " + JSON.stringify(dataArr));
                res.render('index',
                        {
                            title: "Statistics"
                        });
            })
            .catch(function (err) {
                res.send(err);
            });
});

router.get('/documentation', function(req, res){
    res.download('./doku.pdf');
});

router.get('/testGrafik/:convId', function (req, res) {
    convTextStats.getConversationStatisticsPerUser(req.params.convId)
            .then(function (data) {
                console.log("hier: " + JSON.stringify(data));
                return chartToFile.renderAndSavePicture(data.user, 'numItems', 
                '/home/astephan/Praktikum-Andi/MeetingAssistent/node-js-getting-started/assistant/files/pie.png');
            })
            .then(function (path) {
                res.send(path);
            })
            .catch(function (err) {
                res.send("Error: " + err);
            });
});

router.get("/addSampleData", function (req, res) {
    sampleData.addSampleData();
    res.send("lulz");
});

router.get('/text', function (req, res) {
    var promises = [];
    promises.push(convTextStats.getMostActiveConversations(1));
    promises.push(convTextStats.getMostActiveConversations(7));
    promises.push(convTextStats.getMostActiveConversations(31));
    promises.push(convTextStats.getMostActiveConversations());
    promises.push(userTextStats.getMostActiveUsers(1));
    promises.push(userTextStats.getMostActiveUsers(7));
    promises.push(userTextStats.getMostActiveUsers(31));
    promises.push(userTextStats.getMostActiveUsers());

    Promise.all(promises)
            .then(function (dataArr) {
                console.log("INNN: " + JSON.stringify(dataArr));
                res.render('text/index',
                        {
                            title: "Statistics",
                            convsD: dataArr[0],
                            convsW: dataArr[1],
                            convsM: dataArr[2],
                            convs: dataArr[3],
                            usersD: dataArr[4],
                            usersW: dataArr[5],
                            usersM: dataArr[6],
                            users: dataArr[7]
                        });
            })
            .catch(function (err) {
                res.send(err);
            });
});

router.get('/meetingReminder', function (req, res) {
    res.render('meetingReminder/index');
});

router.get('/conv/:convId', function (req, res) {
    res.render('text/conversation',
            {title: "Testtitel"}
    );
});

//router.get('/conv')



module.exports = router;