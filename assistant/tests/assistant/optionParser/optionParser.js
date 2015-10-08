/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var config = require('./../../../config.json');

var assert = require('assert');
var optionParser = require(config.root + '/services/optionParser/optionParser');


describe('optionParser', function () {

    describe('#parseOptions()', function () {
        var tests = [
            {
                text: 'should return correct options object(1)',
                input: {
                    convId: 'testConv',
                    itemId: 'testItem',
                    creatorId: 'testCreator',
                    modificationTime: 'testZeit',
                    creationTime: 'testZeit',
                    text: 'meeting assistant: help'
                },
                output: {
                    convId: 'testConv',
                    itemId: 'testItem',
                    creatorId: 'testCreator',
                    modificationTime: 'testZeit',
                    creationTime: 'testZeit',
                    isInUse: true,
                    writtenOptionsWrong: false,
                    help: {
                        isInUse: true,
                        service: "general"
                    },
                    services: {
                    }
                }
            },
            {
                text: 'should return correct options object(2)',
                input: {
                    convId: 'testConv',
                    itemId: 'testItem',
                    creatorId: 'testCreator',
                    modificationTime: 'testZeit',
                    creationTime: 'testZeit',
                    text: 'meeting assistant: help remind'
                },
                output: {
                    convId: 'testConv',
                    itemId: 'testItem',
                    creatorId: 'testCreator',
                    modificationTime: 'testZeit',
                    creationTime: 'testZeit',
                    isInUse: true,
                    writtenOptionsWrong: false,
                    help: {
                        isInUse: true,
                        service: "meetingReminder"
                    },
                    services: {
                    }
                }
            },
            {
                text: 'should return correct options object(3)',
                input: {
                    convId: 'testConv',
                    itemId: 'testItem',
                    creatorId: 'testCreator',
                    modificationTime: 'testZeit',
                    creationTime: 'testZeit',
                    text: 'ma: remind 08.03.1993 10:12'
                },
                output: {
                    convId: 'testConv',
                    itemId: 'testItem',
                    creatorId: 'testCreator',
                    modificationTime: 'testZeit',
                    creationTime: 'testZeit',
                    isInUse: true,
                    writtenOptionsWrong: false,
                    help: {
                        isInUse: false
                    },
                    services: {
                        meetingReminder: {
                            isInUse: true,
                            writtenOptionsWrong: false,
                            addMeeting: {
                                isInUse: true,
                                date: '1993-03-08T10:12:00.000Z',
                                remindEarlier: 300
                            }
                        }
                    }
                }
            },
            {
                text: 'should return correct options object(4)',
                input: {
                    convId: 'testConv',
                    itemId: 'testItem',
                    creatorId: 'testCreator',
                    modificationTime: 'testZeit',
                    creationTime: 'testZeit',
                    text: 'ma: trolololo'
                },
                output: {
                    convId: 'testConv',
                    itemId: 'testItem',
                    creatorId: 'testCreator',
                    modificationTime: 'testZeit',
                    creationTime: 'testZeit',
                    isInUse: false,
                    writtenOptionsWrong: false,
                    help: {
                        isInUse: false
                    },
                    services: {
                    }
                }
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = optionParser.parseOptions(test.input);
                assert.equal(JSON.stringify(result), JSON.stringify(test.output));
            });
        });
    });

    describe("#validateOptions()", function () {

        var tests = [
            {
                text: "should validate correctly(1)",
                input: {
                    convId: 'testConv',
                    creatorId: 'testCreator',
                    isInUse: true,
                    writtenOptionsWrong: false,
                    help: {
                        isInUse: false
                    },
                    services: {
                        meetingReminder: {
                            isInUse: true,
                            writtenOptionsWrong: false,
                            addMeeting: {
                                isInUse: true,
                                date: '1993-03-08T10:12:00.000Z',
                                remindEarlier: 300
                            }
                        }
                    }
                },
                output: true
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = optionParser.validate(test.input);
                if (test.output === true) {
                    assert.equal(result, test.input);
                }
                else {
                    assert.equal(result, test.output);
                }
            });
        });
    });
});
