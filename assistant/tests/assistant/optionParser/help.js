'use strict';

var config = require('./../../../config.json');

var assert = require('assert');
var helpParser = require(config.root + '/services/optionParser/help');


describe("helpParser", function () {
    describe("#parse()", function () {
        var tests = [
            {
                text: "should not help",
                input: "ma: nichts mit hilfe",
                output: {
                    isInUse: false
                }
            },
            {
                text: "should use general help",
                input: "ma: help",
                output: {
                    isInUse: true,
                    service: "general"
                }
            },
            {
                text: "should give help for the meetingReminder",
                input: "ma: help remind",
                output: {
                    isInUse: true,
                    service: "meetingReminder"
                }
            },
            {
                text: "should not give help",
                input: "ma: remind 08.03.1993 14:50 ",
                output: {
                    isInUse: false
                }
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = helpParser.parse(test.input);

                for (var key in result) {
                    assert.equal(result[key], test.output[key]);
                }
            });
        });
    });
});