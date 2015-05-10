/*
 * AST NodeJS Eyex Sync Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1
 *
 */

var pusher = require("pusher");
var async = require('async');
var config = require('../config/webConfig');

//set up pusher here
var pusherConfig = config.pusherConfig();
var Pusher = new pusher({
    appId: pusherConfig.AppId,
    key: pusherConfig.Key,
    secret: pusherConfig.Secret
});

exports.eyexSync = function(req, res, syncType, companyId){
    var meyexDeviceController = _require('/routes/m-eyex/device');
    if (companyId){
        //get the connected device, mainly OS and VS
        var getDeviceReq = _.clone(req);
        getDeviceReq.query = new Object();
        getDeviceReq.query.DeviceTypes = 'VS,OS';
        getDeviceReq.query.CompanyId = companyId;
        meyexDeviceController.getDevice(getDeviceReq, res, true, function(resGetDeviceErr, resGetDevice, resGetDeviceRowsReturned, resGetDeviceTotalRows){
            if (!resGetDeviceErr && resGetDeviceRowsReturned){
                _.each(resGetDevice, function(device){
                    var deviceId = null;
                    if (_.isObject(device) && !_.isEmpty(device)){
                        deviceId = device._id;
                        if (deviceId) Pusher.trigger(deviceId, 'eyex_sync', syncType);
                    }
                })
            }
        });
    }
}