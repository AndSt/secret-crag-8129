
var config = require('./../../config.json');

var logger = require(config.loggerPath);
var comm = require(config.root + '/utils/communicator');



var start = function (options) {
    logger.debug("addFile.start( " + options.convId + " )");

    return new Promise(function (resolve, reject) {
        resolve(addFile(options));
    });
};

var addFile = function (options) {
    logger.debug("addFile( " + options.convId + ")");

    return new Promise(function (resolve, reject) {
        resolve(comm.sendTextItemWithFiles(options.convId, "", [options.services.addFile.url], options.itemId));
    });
};

module.exports = {
    addFile: addFile
};