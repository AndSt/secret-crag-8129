'use strict';


var config = require('./../../config.json');

var logger = require(config.loggerPath);

var bonusSystem = require(config.root + "/files/bonusSystem");


var computeBonus = function (options) {
    return 5;
};

var computeTooLate = function (confStartTime, userJoinTime) {
    logger.debug("computeTooLate()");

    var tooLate = userJoinTime - confStartTime;

    if (tooLate > bonusSystem.comingTooLate.firstMinusPointAfter) {
        return Math.floor(tooLate / 60) * bonusSystem.comingTooLate.minusPointsPerMinute;
    }
    else {
        return 0;
    }
};

module.exports = {
    computeBonus: computeBonus
};
