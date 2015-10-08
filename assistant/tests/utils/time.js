
var assert = require("assert");
var time = require('./../../utils/time');

describe('utils/time.js', function () {

    describe('#searchDate()', function () {

        var tests = [
            {
                text: 'should return a date IOS 8601 string(1)',
                input: '8.3.1993  10:12',
                output: '1993-03-08T10:12:00.000Z'
            },
            {
                text: 'should return a date IOS 8601 string(2)',
                input: '8.3.1993  10:12',
                output: '1993-03-08T10:12:00.000Z'
            },
            {
                text: 'should return a date IOS 8601 string(3)',
                input: '8.3.1993  10:12',
                output: '1993-03-08T10:12:00.000Z'
            },
            {
                text: 'should return a date IOS 8601 string(4)',
                input: 'Hallo Massenger, bitte erinnere mich am ' +
                        '8.3.1993 um 10:12 wegen dem neuen meeting',
                output: '1993-03-08T10:12:00.000Z'
            }
        ];
        tests.forEach(function (test) {
            it(test.text, function () {
                var result = time.searchDate(test.input);
                assert.equal(test.output, result);
            });
        });
    });

    describe('#getUnixTimeStamp()', function () {
        var date = new Date();
        var tests = [
            {
                text: "should return a correct unix timestamp",
                input: date,
                output: Math.floor(date.getTime() / 1000)
            },
            {
                text: "should return the current unix timestamp",
                input: '1993-08-03T10:12:00.000Z',
                output: '744372720'
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                assert.equal(time.getUnixTimeStamp(test.input), test.output);
            });
        });
    });

    describe('#getUserOutputDate)', function () {
        var tests = [
            {
                text: "should return a nice looking date string",
                input: "744372720",
                output: "Tuesday, 3 August 1993 10:12"
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                assert.equal(time.getUserOutputDate(test.input), test.output);
            });
        });
    });
});