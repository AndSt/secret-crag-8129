
var config = require('./../../config.json');

var assert = require('assert');
var sinon = require('sinon');

var mysql = require('mysql');
var dbConn = require(config.root + '/utils/database').getConnection();
var time = require(config.root + '/utils/time');

var meetingReminder = require(config.root + "/services/meetingReminder/meetingReminder");

//stubbed objects
var dbFunctions = require(config.root + "/services/meetingReminder/dbFunctions");
var icsGenerator = require(config.root + '/utils/icsGenerator');
var comm = require(config.root + '/utils/communicator');


describe('meetingReminder', function () {

    describe('#addMeeting()', function () {

        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            sandbox.stub(dbFunctions, 'insertMeeting', function () {
                return Promise.resolve();
            });
            sandbox.stub(icsGenerator, 'generateIcsForMeeting', function () {
                return Promise.resolve('path');
            });
            sandbox.stub(comm, 'getUsersById', function () {
                return Promise.resolve([
                    {
                        userPresenceState: {
                            timeZoneOffset: 0
                        }
                    }
                ]);
            });
            sandbox.stub(comm, 'sendTextItem', function () {
                return Promise.resolve();
            });
            sandbox.stub(comm, 'sendTextItemWithFiles', function () {
                return Promise.resolve();
            });
        });
        afterEach(function () {
            sandbox.restore();
        });

        var tests = [
            {
                text: "should add a meeting and tell the user",
                item: {
                    itemId: 'testItemId',
                    convId: 'testConvId',
                    services: {
                        meetingReminder: {
                            isInUse: true,
                            addMeeting: {
                                date: '1993-08-03T10:12:00.000Z'
                            }
                        }
                    }
                },
                output: "Inserting of remindMeeting went well"
            },
            {
                text: "should add a meeting and tell the user with an ics file",
                item: {
                    itemId: 'testItemId',
                    convId: 'testConvId',
                    services: {
                        meetingReminder: {
                            isInUse: true,
                            addMeeting: {
                                date: '1993-08-03T10:12:00.000Z',
                                ics: true
                            }
                        }
                    }
                },
                output: "Inserting of remindMeetingWithIcs went well"
            }
        ];
        tests.forEach(function (test) {
            it(test.text, function (done) {
                meetingReminder.addMeeting(test.item, test.options)
                        .then(function () {
                            sinon.assert.calledOnce(dbFunctions.insertMeeting);
                            if (test.item.services.meetingReminder.addMeeting.ics === true) {
                                sinon.assert.calledOnce(
                                        comm.sendTextItemWithFiles);
                                sinon.assert.notCalled(
                                        comm.sendTextItem);
                            }
                            else {
                                sinon.assert.notCalled(
                                        comm.sendTextItemWithFiles);
                                sinon.assert.calledOnce(
                                        comm.sendTextItem);
                            }
                            done();
                        })
                        .catch(done);
            });
        });
    });
    describe('#askForRepetition()', function () {
        var tests = [
            {
                text: "should ask the user for repetition(1)",
                input: {
                    itemId: 'testId',
                    convId: 'testABC',
                    ended: {
                        duration: 1000
                    }
                },
                output: "Successfully asked for repetition."
            },
            {
                text: "should ask the user for repetition(2)",
                input: {
                    itemId: 'testId2',
                    convId: 'testABC2',
                    ended: {
                        duration: 5000
                    }
                },
                output: "Successfully asked for repetition."
            },
            {
                text: "should ask the user for repetition(3)",
                input: {
                    itemId: 'testId3',
                    convId: 'testABC3',
                    ended: {
                        duration: 60273
                    }
                },
                output: "Successfully asked for repetition."
            }
        ];
        var sandbox2;
        beforeEach(function () {
            sandbox2 = sinon.sandbox.create();
            sandbox2.stub(dbFunctions, 'insertConversationStatus', function () {
                return Promise.resolve();
            });
            sandbox2.stub(comm, 'sendTextItem', function () {
                return Promise.resolve();
            });
        });
        afterEach(function () {
            sandbox2.restore();
        });
        tests.forEach(function (test) {
            it(test.text, function (done) {
                meetingReminder.askForRepetition(test.input)
                        .then(function (result) {
                            sinon.assert.calledOnce(
                                    dbFunctions.insertConversationStatus);
                            sinon.assert.calledOnce(
                                    comm.sendTextItem);
                            assert.equal(result, test.output);
                            done();
                        })
                        .catch(done);
            });
        });
    });


    describe("#processRepetitionAnswer()", function () {

//        dbFunctions.updateConversationStatusActive

        var sandbox3;

        beforeEach(function () {
            sandbox3 = sinon.sandbox.create();

            sandbox3.stub(dbFunctions, 'updateConversationStatusActive', function () {
                return Promise.resolve();
            });
            sandbox3.stub(meetingReminder, 'addMeeting', function () {
                return Promise.resolve();
            });
        });

        afterEach(function () {
            sandbox3.restore();
        });

        var tests = [
            {
                updates: false,
                repetition: false,
                text: '(1) should not do a repetition or a update',
                inputItem: {
                    itemId: 'testId3',
                    convId: 'testABC3',
                    text: 'Test Nummero Uno'
                },
                inputStatus: {
                    ID: 0,
                    newDate: 1000
                },
                outputUseOptionParser: true
            },
            {
                updates: true,
                repetition: true,
                text: '(2) should do a repetition and a update',
                inputItem: {
                    itemId: 'testId3',
                    convId: 'testABC3',
                    text: 'meeting assistent: yes'
                },
                inputStatus: {
                    ID: 0,
                    newDate: 1000,
                    information: JSON.stringify({
                        oldDate: 1000,
                        newDate: 1000,
                        addedQuestionTime: time.getUnixTimeStamp()
                    })
                },
                outputUseOptionParser: false
            },
            {
                updates: true,
                repetition: false,
                text: '(3)should do no repetition, but a update',
                inputItem: {
                    itemId: 'testId3',
                    convId: 'testABC3',
                    text: 'meeting assistent: no'
                },
                inputStatus: {
                    ID: 0,
                    newDate: 1000,
                    information: JSON.stringify({
                        oldDate: 1000,
                        newDate: 1000,
                        addedQuestionTime: time.getUnixTimeStamp()
                    })
                },
                outputUseOptionParser: true
            },
            {
                updates: true,
                repetition: true,
                text: '(4) should do a repetition and a update',
                inputItem: {
                    itemId: 'testId3',
                    convId: 'testABC3',
                    text: 'ma: yes'
                },
                inputStatus: {
                    ID: 0,
                    newDate: 1000,
                    information: JSON.stringify({
                        oldDate: 1000,
                        newDate: 1000,
                        addedQuestionTime: time.getUnixTimeStamp()
                    })
                },
                outputUseOptionParser: false
            },
            {
                updates: true,
                repetition: false,
                text: '(5) should do no repetition, but a update',
                inputItem: {
                    itemId: 'testId3',
                    convId: 'testABC3',
                    text: 'ma: no'
                },
                inputStatus: {
                    ID: 0,
                    newDate: 1000,
                    information: JSON.stringify({
                        oldDate: 1000,
                        newDate: 1000,
                        addedQuestionTime: time.getUnixTimeStamp()
                    })
                },
                outputUseOptionParser: true
            },
            {
                updates: false,
                repetition: false,
                text: '(6) should do no repetition, but a update',
                inputItem: {
                    itemId: 'testId3',
                    convId: 'testABC3',
                    text: 'trolololol'
                },
                inputStatus: {
                    ID: 0,
                    newDate: 1000,
                    information: JSON.stringify({
                        oldDate: 1000,
                        newDate: 1000,
                        addedQuestionTime: time.getUnixTimeStamp()
                    })
                },
                outputUseOptionParser: true
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function (done) {
                meetingReminder.processRepetitionAnswer(test.inputItem,
                        test.inputStatus)
                        .then(function (result) {
                            if (test.updates) {
                                sinon.assert.calledOnce(dbFunctions.updateConversationStatusActive);
                                if (test.repetition === true) {
                                    sinon.assert.calledOnce(meetingReminder.addMeeting);
                                }
                                else {
                                    sinon.assert.notCalled(meetingReminder.addMeeting);
                                }
                            }
                            else {
                                sinon.assert.notCalled(dbFunctions.updateConversationStatusActive);
                                sinon.assert.notCalled(meetingReminder.addMeeting);
                            }
                            assert.equal(test.outputUseOptionParser, result.useOptionParser);
                            done();
                        })
                        .catch(done);
            });
        });
    });
});