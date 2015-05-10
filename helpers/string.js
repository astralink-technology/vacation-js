/*
 * AST NodeJS JSON String Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 * Support for Pad Front Added
 *
 */

exports.padFront = function (req, res, num, size){
    var padded = num + "";
    while (padded.length < size) padded = "0" + padded;
    return padded;
}

exports.toAnName = function (req, res, name){
    var name = name.replace(/ /g, '-'); //remove spaces
    name = name.replace(/\W/g, ''); //remove non alpha numeric
    name = name.toLowerCase(); //lowercase
    return name;
}

exports.toName = function (req, res, firstName, lastName){
    var name = null;
    if (firstName && lastName){
        name = firstName + ' ' + lastName;
    }else if (firstName){
        name = firstName;
    }else if (lastName){
        name = lastName;
    }
    return name;
}

exports.padFront = function (req, res, num, size){
    var padded = num + "";
    while (padded.length < size) padded = "0" + padded;
    return padded;
}

exports.addressParser = function (req, res){

}
