/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var callStats = require("./callStatistics");

var addSampleData = function () {

    var options = {};

    options = {
        convId: "testConvId",
        conferenceId: "testConference",
        userId: "testUser",
        time: Math.floor(Date.now() / 1000)
    };

    var l = 5;
    var n = 0;
    var m = 0;

    var i, j, k = 0;

    for (i = 0; i < l; i++) {

        options.conferenceId = "testConference" + i;
        options.userId = "testUser" + i;
        callStats.conferenceStarted(options);

        n = Math.floor(Math.random() * 9) + 2;
        for (j = 0; j < n; j++) {
            options.userId = "testUser" + j;
            options.time += Math.floor(Math.random() * 300);
            callStats.userJoined(options);
            m = Math.floor(Math.random() * 10) + 1;
            for (k = 0; k < m; k++) {   
                options.time += Math.floor(Math.random() * 300);
                callStats.userStartsSpeaking(options);
                options.time += Math.floor(Math.random() * 300);
                callStats.userFinishedSpeaking(options);
            }
        }

        for (j = 0; j < n; j++) {
            options.userId = "testUser" + j;
            options.time += Math.floor(Math.random() * 300);
            callStats.userLeft(options);
        }

        options.userId = "testUser" + i;
        options.time += Math.floor(Math.random() * 300);
        callStats.conferenceEnded(options);
    }
};

module.exports = {
    addSampleData: addSampleData
};