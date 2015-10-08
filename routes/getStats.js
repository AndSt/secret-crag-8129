'use strict';

var express = require('express');
var router = express.Router();

var convTextStats = require("./../assistant/services/textStatistics/conversation");
var userTextStats = require("./../assistant/services/textStatistics/user");
var statistics = require('./../assistant/services/textStatistics/main');
var callStats = require('./../assistant/services/callStatistics/callStatistics');


router.get('/:convId/userTimeLine', function (req, res) {

});

router.get('/user/:userId', function (req, res) {
    userTextStats.getUserStatistics(req.params.userId)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send("hat leider nicht funktioniert");
            });
});

router.get('/user/mostActive/:days', function (req, res) {
    userTextStats.getMostActiveUsers(req.params.days)
            .then(function (users) {
                res.json(users);
            })
            .catch(function (err) {
                res.send("Error!");
            });
});

router.get('/user/:userId/:convId', function (req, res) {
    convTextStats.getConversationStatisticsOfUser(req.params.convId, req.params.userId)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send("Hat leider nicht funktioniert");
            });
});

router.get('/conversation/all/:convId', function (req, res) {
    convTextStats.getConversationStatistics(req.params.convId)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send("hat leider nicht funktioniert");
            });
});

router.get('/conversation/mostActive/:days', function (req, res) {
    if (req.params.days) {
        convTextStats.getMostActiveConversations(req.params.days)
                .then(function (convs) {
                    res.json(convs);
                })
                .catch(function (err) {
                    res.send(JSON.stringify(err));
                });
    }
    else {
        res.send("WTHF");
    }
});



router.get('/conversation/conversationUser/:convId/:userId', function (req, res) {
    convTextStats.getConversationStatisticsOfUser(req.params.convId, req.params.userId)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send("hat leider nicht funktioniert");
            });
});

router.get('/conversation/conversationPerUser/:convId', function (req, res) {
    convTextStats.getConversationStatisticsPerUser(req.params.convId)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send(err);
            });
});

router.get('/conversation/conversationPerUser/:convId/:days', function (req, res) {
    convTextStats.getConversationStatisticsPerUser(req.params.convId, req.params.days)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send(err);
            });
});

router.get('/calls/convSpeakTime/:convId', function (req, res) {
    callStats.getConversationSpeakingTime(req.params.convId)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send(err);
            });
});

router.get('/calls/convSpeakTimePerConf/:convid', function (req, res) {
    callStats.getConversationSpeakingTimePerConference(req.params.convId)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send(err);
            });
});

module.exports = router;