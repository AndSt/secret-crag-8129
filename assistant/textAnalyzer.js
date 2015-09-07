var mysql = require('mysql');
var connection = require('./../utils/database').getConnection();
var logger = require('./../utils/logger');
var comm = require('./communication');

var analyzeTextItems = function(item, partials, callback) {
    
};

module.exports = {
    analyzeTextItems : analyzeTextItems
};


