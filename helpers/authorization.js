/*
 * AST NodeJS Authorization Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 * Modified the already Authorized to support new mongodb integration
 *
 */

var jwtHelper = _require('/helpers/jwt');
var dbConnectHelper = _require('/helpers/dbConnect');
var apiHelper = _require('/helpers/api');
var trackingHelper = _require('/helpers/tracking');
var cloudAccessModel = _require('/models/cloud_access');

exports.authorizationLevels = function(req, res, levelRequired){
    if (req.session.authorizationLevel < levelRequired || !req.session.authorizationLevel){
        //user is not allowed to view the page, redirect to illegal page
        res.redirect('/error/401');
    }
}

exports.alreadyAuthorized = function (req, res, redirectionPage){
    if (req.session.authorizationLevel){
        //if user is authenticated, redirect user to the page
        res.redirect(redirectionPage);
    }
}

exports.authorizeApi = function (req, res, authLevel, bypass, callback){
    var token = null;
    var appId = null;
    var secret = null;

    //if admin bypass
    if (bypass){
        callback();
        return;
    }

    //authentication for the logged in
    if (req.session.authorizationLevel && (req.session.authorizationLevel >= authLevel)) {
        callback();
        return;
    }

    //authentication for those without logged in
    if (req.body.Token) token = req.body.Token;
    if (req.body.AppId) appId = req.body.AppId;
    if (req.query.Token) token = req.query.Token;
    if (req.query.AppId) appId = req.query.AppId;

    if (token && appId){
        var queryParms = new Object();
        queryParms.token = token;
        queryParms._id = appId;
        //count the total number of rows.
        mongodb.model('cloud_access')
            .find(queryParms)
            .select({
                '__v' : 0
            })
            .exec(function(err, data){
                if (!err && data.length) {
                    var secret = data[0].secret;
                    var decodedObject = jwtHelper.jwtDecode(req, res, token, secret);
                    if (decodedObject.EnterpriseId){
                        //tracking
                        var trackingObject = new Object();
                        trackingObject.enterpriseId = decodedObject.EnterpriseId;
                        trackingObject.type = 'API';
                        trackingHelper.trackApi(req, res, trackingObject, function(){
                            callback();
                        });
                    } else {
                        apiHelper.apiRes(req, res, null, null, null, "Unauthorized", 401);
                    }
                }else{
                    apiHelper.apiRes(req, res, null, null, null, "Unauthorized", 401);
                }
            });

    }else{
        apiHelper.apiRes(req, res, null, null, null, "Unauthorized", 401);
    }

}
