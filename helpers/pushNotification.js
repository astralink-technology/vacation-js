/*
 * AST NodeJS Push Notification Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 */

var request = require('request');
var secureHttpProtocol = 'https://';
var normalHttpProtocol = 'http://';

exports.sendPush = function(req, res, message, devices, secured, pushServer, pushUrl){
    if (
        message && devices
    ){
        var postObject = new Object();
        postObject.devices = devices;
        postObject.message = message;
        var apiUrl = normalHttpProtocol + pushServer + pushUrl;
        if (secured){
            apiUrl = secureHttpProtocol + pushServer + pushUrl;
        }
        var options = new Object();secured
        options.url = apiUrl;
        options.method  = 'POST';
        options.json = true;
        options.body = postObject;
        request(options, function (error, response, body) {
            if (!error){
                console.log('Sending push notification - ' + body);
            }else{
                console.log('Sending push notification - ERROR : ' + error);
            }
        })
    }else{
        apiHelper.apiRes(req, res, null, null, null, 'Message and Device Information Required', 500, callback);
    }
}