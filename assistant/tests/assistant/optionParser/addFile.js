'use strict';

var config = require('./../../../config.json');

var assert = require('assert');
var addFileParser = require(config.root + '/services/optionParser/addFile');

describe("optionParser.addFile", function () {

    describe("#parse", function () {
        var tests = [
            {
                text: "should add a file(1)",
                input: "ma: addFile https://upload.wikimedia.org/wikipedia/en/b/bc/Torus_with_cross-hatched_wireframe.gif",
                output: {
                    isInUse: true,
                    url: "https://upload.wikimedia.org/wikipedia/en/b/bc/Torus_with_cross-hatched_wireframe.gif"
                }
            },
            {
                text: "should add a file(2)",
                input: "ma: add file https://upload.wikimedia.org/wikipedia/en/b/bc/Torus_with_cross-hatched_wireframe.gif",
                output: {
                    isInUse: true,
                    url: "https://upload.wikimedia.org/wikipedia/en/b/bc/Torus_with_cross-hatched_wireframe.gif"
                }
            },
            {
                text: "should not add a file(1)",
                input: "ma: add file https://  https://",
                output: {
                    isInUse: false,
                    hasTooManyValues: true
                }
            },
            {
                text: "should not add a file(2)",
                input: "ma: addnoFile",
                output: {
                    isInUse: false
                }
            },
            {
                text: "should not add a file(3)",
                input: "ma: addFile",
                output: {
                    isInUse: false,
                    foundUrl: false
                }
            }
        ];

        tests.forEach(function (test) {
            it(test.text, function () {
                var result = addFileParser.parse(test.input);
                for (var key in test.output) {
                    assert.equal(result[key], test.output[key]);
                }
            });
        });
    });

});


