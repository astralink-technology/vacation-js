/*
 * AST NodeJS Tracking Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 *
 */

var uaParser = require('ua-parser');
var request = require('request');
var config = _require('/config/webConfig');
var trackingModel = _require('/routes/m-core/tracking');

exports.trackApi = function (req, res, trackingObject, callback){
    var trackingConfig = config.trackingConfig();
    var enterpriseWhiteList = trackingConfig.enterpriseWhiteList;

    var ip = req.ip;
    var url = req._parsedUrl.pathname
    var enterpriseId = trackingObject.enterpriseId;
    var type = trackingObject.type;
    var method = req.method;
    var parameters = null;
    if (Object.getOwnPropertyNames(req.query).length > 0){
        parameters = JSON.stringify(req.query)
    }
    if (Object.getOwnPropertyNames(req.body).length > 0){
        parameters = JSON.stringify(req.body)
    }

    var operatingSystem = null;
    var operatingSystemVersion = null;
    var userAgent = null;
    var userAgentVersion = null;
    var device = null;
    var extraData = null;

    var r = uaParser.parse(req.headers['user-agent']);
    if (r.os){
        operatingSystem = r.os.family;
        if (!r.os.major) r.os.major = 0;
        if (!r.os.minor) r.os.minor = 0;
        if (!r.os.patch) r.os.patch = 0;
        operatingSystemVersion = r.os.major + '.' + r.os.minor + '.' + r.os.patch;
    }
    if (r.ua){
        userAgent = r.ua.family;
        if (!r.ua.major) r.ua.major = 0;
        if (!r.ua.minor) r.ua.minor = 0;
        if (!r.ua.patch) r.ua.patch = 0;
        userAgentVersion = r.ua.major + '.' + r.ua.minor + '.' + r.ua.patch;
    }
    if (r.device){
        device = r.device.family;
    }
    if (r.string){
        extraData = r.string;
    }

    var inEnterpriseWhiteList = false;
    for(var wl = 0; wl < enterpriseWhiteList.length; wl ++){
        if (enterpriseId == enterpriseWhiteList[wl]){
            inEnterpriseWhiteList = true;
        }
    }

    if (inEnterpriseWhiteList) { //do not track when in local mode
        if (callback){
            callback();
        }
    }else{

        //add the tracking
        var trackReq = _.clone(req);
        trackReq.body = new Object();
        trackReq.body.Name = url;
        trackReq.body.IpAddress = ip;
        trackReq.body.Enterprise = enterpriseId;
        trackReq.body.Type = type;
        trackReq.body.OperatingSystem = operatingSystem;
        trackReq.body.OperatingSystemVersion = operatingSystemVersion;
        trackReq.body.UserAgent = userAgent;
        trackReq.body.UserAgentVersion = userAgentVersion;
        trackReq.body.UserDevice = device;
        trackReq.body.ExtraData = extraData;
        trackReq.body.Method = method;
        trackReq.body.Parameters = parameters;

        trackingModel.addTracking(trackReq, res, true, function(){
            if (callback){
                callback();
            }
        });
    }
}
