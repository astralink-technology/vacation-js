/*
 * AST NodeJS Cryptography Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 */

var config = _require('/config/webConfig');
var bcrypt = require('bcrypt');
var request = require('request');

exports.encrypt = function(req, res, string){
    var hash = bcrypt.hashSync(string, 10);
    return hash;
}
exports.decrypt = function(req, res, string, hash){
    var match = bcrypt.compareSync(string, hash);
    if (match){
        return true;
    }else{
        return false;
    }
}
