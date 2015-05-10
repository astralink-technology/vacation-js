/*
 * AST NodeJS Date Time Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 */

var moment = require('moment');
exports.utcNow = function(req, res){
    return moment().utc();
};

exports.now = function(req, res){
    return moment().format();
}

exports.convertToUtc = function (req, res, dateTime){
    if (dateTime){
        return moment(dateTime).utc().format();
    }else{
        return false;
    }
}
