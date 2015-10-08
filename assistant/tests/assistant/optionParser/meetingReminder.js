
var config = require('./../../../config.json');

var assert = require('assert');
var meetingReminderParser = require(config.root + '/services/optionParser/meetingReminder');

describe("meetingReminderParser", function () {

    describe("#parse()", function () {
        var tests = [
            {
                text: 'should return correct option object(1)',
                input: ': add meeting on 8.3.1993 10:12',
                output: {
                    isInUse: true,
                    writtenOptionsWrong: false,
                    addMeeting: {
                        isInUse: true,
                        date: '1993-03-08T10:12:00.000Z',
                        remindEarlier: 300
                    }
                }
            },
            {
                text: 'should return correct option object(2)',
                input: ': add meeting on 8.3.1993 10:12 ics',
                output: {
                    isInUse: true,
                    writtenOptionsWrong: false,
                    addMeeting: {
                        isInUse: true,
                        date: '1993-03-08T10:12:00.000Z',
                        remindEarlier: 300,
                        ics: true
                    }
                }
            },
            {
                text: 'should return correct option object(3)',
                input: ': add meeting',
                output: {
                    isInUse: false,
                    writtenOptionsWrong: true,
                    addMeeting: {
                        isInUse: false,
                        writtenOptionsWrong: true,
                        sorryText: "No valid date/time could be found"
                    }
                }
            },
            {
                text: 'should return correct option object(3)',
                input: ': remind list',
                output: {
                    isInUse: true,
                    writtenOptionsWrong: false,
                    list: {
                        isInUse: true
                    }
                }
            },
            {
                text: 'should return correct option object(4)',
                input: 'meetings delete 12345',
                output: {
                    isInUse: true,
                    writtenOptionsWrong: false,
                    delete: {
                        isInUse: true,
                        id: "12345"
                    }
                }
            },
            {
                text: 'should return correct option object(5)',
                input: ': meetings delete 1234 1234',
                output: {
                    isInUse: false,
                    writtenOptionsWrong: true,
                    delete: {
                        isInUse: false,
                        writtenOptionsWrong: true
                    }
                }
            },
            {
                text: 'should return correct option object(6)',
                input: ' whats up jo?',
                output: {
                    isInUse: false,
                    writtenOptionsWrong: false
                }
            }

        ];
        tests.forEach(function (test) {
            it(test.text, function () {
                var result = meetingReminderParser.parse(test.input);
                assert.equal(JSON.stringify(result), JSON.stringify(test.output));
            });
        });
    });

    describe("#parseAddMeeting()", function () {
        var tests = [
            {
                text: 'should return correct option object(1)',
                input: 'meeting assistant: add meeting on 8.3.1993 10:12',
                output: {
                    isInUse: true,
                    date: '1993-03-08T10:12:00.000Z',
                    remindEarlier: 300
                }
            },
            {
                text: 'should return correct option object(2)',
                input: 'meeting assistant: add meeting on 8.3.1993 10:12 ics',
                output: {
                    isInUse: true,
                    date: '1993-03-08T10:12:00.000Z',
                    remindEarlier: 300,
                    ics: true
                }
            },
            {
                text: 'should return correct option object(3)',
                input: 'meeting assistant: add meeting',
                output: {
                    isInUse: false,
                    writtenOptionsWrong: true,
                    sorryText: "No valid date/time could be found"
                }
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = meetingReminderParser.parseAddMeeting(test.input);
                for (var key in result) {
                    assert.equal(result[key], test.output[key]);
                }
            });
        });
    });

    describe("#parseDelete()", function () {

        var tests = [
            {
                text: "should delete(1)",
                input: "delete 12345",
                output: {
                    isInUse: true,
                    id: "12345"
                }
            },
            {
                text: "should delete(2)",
                input: "meetings delete 12345",
                output: {
                    isInUse: true,
                    id: "12345"
                }
            },
            {
                text: "should not delete(1)",
                input: "ma: delete 12345 12345",
                output: {
                    isInUse: false,
                    writtenOptionsWrong: true
                }
            },
            {
                text: "should not delete(2)",
                input: "ma: delete 123a45",
                output: {
                    isInUse: false,
                    writtenOptionsWrong: true
                }
            },
            {
                text: "should not delete(3)",
                input: "ma: delete k",
                output: {
                    isInUse: false,
                    writtenOptionsWrong: true
                }
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = meetingReminderParser.parseDelete(test.input);

                for (var key in result) {
                    assert.equal(result[key], test.output[key]);
                }
            })
                    ;
        });
    });

    describe("#validate()", function () {

        var tests = [
            {
                text: "should be correct(1)",
                input: {
                    isInUse: true,
                    writtenOptionsWrong: false,
                    addMeeting: {
                        isInUse: true,
                        date: '1993-03-08T10:12:00.000Z',
                        remindEarlier: 300
                    }
                },
                output: true
            },
            {
                text: "should be correct(2)",
                input: {
                    isInUse: true,
                    writtenOptionsWrong: false
                },
                output: {error: "fatal error"}
            },
            {
                text: "should be incorrect(1)",
                input: {
                    isInUse: true,
                    writtenOptionsWrong: false,
                    addMeeting: {
                        isInUse: true,
                        date: '1993-03-08T10:12:00.000Z',
                        remindEarlier: 300
                    },
                    list: {
                        isInUse: true
                    }
                },
                output: {error: "meetingReminderTooMuchServices"}
            },
            {
                text: "should be incorrect(1)",
                input: {
                    isInUse: false,
                    writtenOptionsWrong: false
                },
                output: {error: "fatal error"}
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = meetingReminderParser.validate(test.input);
                if (result.hasOwnProperty("error")) {
                    assert.equal(result.error, test.output.error);
                }
                else {
                    assert.equal(result, test.output);
                }
            });
        });
    });
});

