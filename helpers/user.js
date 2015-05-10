/*
 * AST NodeJS JSON User Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1
 *
 * (To be deprecated after postgresql is not in use anymore)
 */

var dbConnectHelper = _require('/helpers/dbConnect');

exports.getTargetUserDetails = function(req, res, targetId, callback){
    dbConnectHelper.connectAndQuery(req, res
        , 'SELECT * FROM  get_admin_entity_detail($1, $2, $3, $4)'
        , [
            targetId
            , null
            , null
            , null
        ], function(result){
            var targetUserObject = new Object();
            if (result.rows[0]){
                targetUserObject = result.rows[0];
            }
            callback(targetUserObject);

        });
}

exports.getTargetUserAndDeviceDetails = function (req, res, targetEntityId, callback){
    dbConnectHelper.connectAndQuery(req, res
        , 'SELECT * FROM  get_admin_entity_device_relationship_details($1, $2, $3, $4)'
        , [
            targetEntityId
            , null
            , null
            , null
        ], function(result){
            var targetUserObject = new Object();
            if (result.rows[0]){
                targetUserObject = result.rows[0];
            }
            callback(targetUserObject);
        });
}
