/*
 * AST NodeJS ID Generator Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 * Added generation of sip password
 *
 */

var config = _require('/config/webConfig');
var dbconnectHelper = _require('/helpers/dbConnect');
var generateCharacters = function(len, chars){
    var text = "";
    for( var i = 0; i < len; i++ )
        text += chars.charAt(Math.floor(Math.random() * chars.length));

    return text;
}
exports.generateId = function(req, res){
    var rand = generateCharacters(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    var rand2 = generateCharacters(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    var rand3 = generateCharacters(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    var result = rand + "-" + rand2 + "-" + rand3;

    return result;
}

exports.generateIdFromDb = function(req, res){
    dbconnectHelper.connectAndQuery(
        req
        , res
        , 'SELECT * FROM  generate_id()'
        , []);
}

exports.imageNameGen = function (req, res){
    return generateCharacters(20, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
}

exports.secretGen = function (req, res){
    return generateCharacters(20, '0123456789abcdefghijklmnopqrstuvwxyz');
}

exports.generateSipPassword = function (req, res){
    return generateCharacters(8, '0123456789abcdefghijklmnopqrstuvwxyz');
}
