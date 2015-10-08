'use strict';

var config = require('./../../config.json');

var assert = require('assert');
var helper = require(config.root + '/utils/stringHelper');

describe("utils.stringHelper", function(){
    
        describe("#textStartsWith()", function () {
        var sources = [
            "ma:",
            "meeting assistent:",
            "assistant:",
            "meeting assistant:",
            "assistent:",
            "asistent:",
            "asistant"
        ];
        var tests = [
            {
                text: "should find something(1)",
                input: {
                    text: "ma: was geht ab"
                },
                output: true
            },
            {
                text: "should find something(2)",
                input: {
                    text: "meeting assistant: was geht ab"
                },
                output: true
            },
            {
                text: "should not find something(3)",
                input: {
                    text: "meetingassistant: was geht ab"
                },
                output: false
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = helper.textStartsWith(test.input.text, sources);
                assert.equal(result, test.output);
            });
        });
    });

    describe("#textContains()", function () {
        var sources = [
            "remind",
            "add a meeting",
            "add meeting",
            "new meeting",
            "add a new meeting",
            "delete"
        ];
        var tests = [
            {
                text: "should find something(1)",
                input: {
                    text: "ma: remind 18.09.2015 13:55"
                },
                output: true
            },
            {
                text: "should find something(2)",
                input: {
                    text: "please add a new meeting on tuesday"
                },
                output: true
            },
            {
                text: "should not find something(3)",
                input: {
                    text: "addmeeting"
                },
                output: false
            },
            {
                text: "should not find something(4)",
                input: {
                    text: "meeting assistant: delete 12345"
                },
                output: true
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = helper.textContains(test.input.text, sources);
                assert.equal(result, test.output);
            });
        });
    });
    
});
