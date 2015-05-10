/*
 * AST NodeJS Authentication Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.2
 *
 * Added slug support. PLEASE include slug in JSON for version 2.1.1
 * Added prefix support for sign up
 * Added generic change password method
 * Changed require entity controller to absolute wrapping
 *
 */

var cryptHelper = _require('/helpers/crypt');
var dateTimeHelper = _require('/helpers/dateTime');
var dbConnectHelper = _require('/helpers/dbConnect');
var idGenHelper = _require('/helpers/idGen');
var apiHelper = _require('/helpers/api');
var stringHelper = _require('/helpers/string');
var slug = require('slug')
var async = require('async')

var entityController = _require('/routes/m-core/entity');

function updateAuthenticationLastLogIn(req, res, authenticationId, callback){
    var loginTime = dateTimeHelper.utcNow();
    dbConnectHelper.connectAndQuery(req, res
        , 'UPDATE authentication SET ' +
        'last_login = $1 WHERE ' +
        'authentication_id =  $2'
        , [
            loginTime
            , authenticationId
        ], function(result){
            if (callback){
                callback(result);
            }
        });
}

function checkUserExists(req, res, userString, callback){
    var userStringLower = userString.toLowerCase();
    dbConnectHelper.connectAndQuery(req, res
        , 'SELECT authentication_id FROM authentication WHERE ' +
        'authentication_string_lower = $1'
        , [
            userStringLower
        ],
        function(result){
            if (result.rows.length > 0){
                if (callback){
                    callback(true);
                }
            }else{
                if (callback){
                    callback(false);
                }
            }
        });
}

function getEntityDetails(req, res, authenticationId, callback){
    dbConnectHelper.connectAndQuery(req, res
        , 'SELECT * FROM  get_admin_entity_detail($1, $2, $3, $4, $5)'
        , [
            null
            , authenticationId
            , null
            , null
            , null
        ]
        , function(result){
            if (callback){
                callback(result);
            }
        });
}

function startUserSession(req, res, entityDetails){
    req.session.firstName = entityDetails.rows[0].first_name;
    req.session.lastName = entityDetails.rows[0].last_name;
    req.session.name = entityDetails.rows[0].name;
    req.session.approved = entityDetails.rows[0].approved;
    req.session.entityId = entityDetails.rows[0].entity_id;
    req.session.authenticationId = entityDetails.rows[0].authentication_id;
    req.session.authorizationLevel = entityDetails.rows[0].authorization_level;
}

//directly authenticateUser and create a new session without the need for logging in
exports.authenticateExpress = function (req, res, userString, authenticationId, callback){
    if (authenticationId){
        updateAuthenticationLastLogIn(req, res, authenticationId, function(){
            //get the details and initiate user session
            getEntityDetails(req, res, authenticationId, function(entityDetails){;
                startUserSession(req, res, entityDetails);
                if (callback){
                    callback(true, entityDetails);
                }
            });
        });
    }else if (userString){
        var userStringLower = userString.toLowerCase();
        dbConnectHelper.connectAndQuery(req, res
            , 'SELECT authentication_id FROM authentication WHERE ' +
            'authentication_string_lower = $1'
            , [
                userStringLower
            ],
            function(result){
                //log the user in
                var derivedAuthId = result.rows[0].authentication_id;
                //update the lastLogin
                updateAuthenticationLastLogIn(req, res, derivedAuthId, function(){
                    //get the details and initiate user session
                    getEntityDetails(req, res, derivedAuthId, function(entityDetails){
                        startUserSession(req, res, entityDetails);
                        if (callback){
                            callback(true, entityDetails);
                        }
                    });
                });
            });
    }else{
        if (callback){
            callback(true, null);
        }
    }
}

//Generic log in method
exports.authenticate = function(req, res, userString, pass, legacy, callback){
    var userStringLower = userString.toLowerCase();
    dbConnectHelper.connectAndQuery(req, res
        , 'SELECT * FROM authentication WHERE ' +
        'authentication_string_lower =  $1'
        , [userStringLower]
        , function(result){
            if (result.rows.length == 0){
                if (callback){
                    callback(false);
                }
            }else{
                var authenticationId = result.rows[0].authentication_id;
                //if user is found, check the password
                var userHash = result.rows[0].hash;
                var authenticated = cryptHelper.decrypt(req, res, pass, userHash);
                if (authenticated){
                    getEntityDetails(req, res, authenticationId, function(entityDetails){
                        //if account is disabled, user cannot log in
                        if (entityDetails.rows[0].disabled){
                            if (callback){
                                callback('disabled');
                            }
                        }else{
                            startUserSession(req, res, entityDetails);
                            if (callback){
                                callback(true, entityDetails);
                            }
                        }
                    });
                    updateAuthenticationLastLogIn(req, res, authenticationId);
                }else{
                    if (callback){
                        callback(false);
                    }
                }
            }
        });
}

//Generic signup method
exports.newAuthentication = function(req, res, userString, pass, firstName, lastName, callback, authorizationLevel){
    var userStringLower = userString.toLowerCase();
    var hash = cryptHelper.encrypt(req, res, pass);
    var name = firstName + " " + lastName;

    var authenticationId = idGenHelper.generateId();
    var entityId = idGenHelper.generateId();

    var createDate = dateTimeHelper.utcNow();
    var userAuthLevel = 300;

    if(authorizationLevel){
        userAuthLevel = authorizationLevel;
    }

    checkUserExists(req, res, userString, function(exist){
        if (!exist){
            dbConnectHelper.connectAndQuery(
                req
                , res
                , 'SELECT * FROM  add_authentication($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)'
                , [
                    authenticationId
                    , userString
                    , userStringLower
                    , hash
                    , null
                    , null
                    , null
                    , null
                    , null
                    , null
                    , userAuthLevel
                    , createDate
                    , null
                ],
                function(){
                    dbConnectHelper.connectAndQuery(
                        req
                        , res
                        , 'SELECT * FROM  add_entity($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)'
                        , [
                            entityId
                            , firstName
                            , lastName
                            , null
                            , name
                            , null
                            , 'f'
                            , 'U'
                            , createDate
                            , null
                            , authenticationId
                            , null
                            , null
                            , null
                            , 't'
                        ],
                        function(){
                            //after creating both the authentication and entity, return the entity detail
                            dbConnectHelper.connectAndQuery(
                                req
                                , res
                                , 'SELECT * FROM  get_admin_entity_detail($1, $2, $3, $4, $5)'
                                , [
                                    entityId
                                    , authenticationId
                                    , null
                                    , null
                                    , null
                                ],
                                function(result){
                                    if (callback){
                                        callback(result);
                                    }
                                }
                            );
                        }
                    );
                });
        }else{
            var result = new Object();
            result.Error = true;
            result.ErrorDesc = "User Exists";
            result.ErrorCode = 500;
            if (callback){
                callback(result);
            }
        }
    })
}

//Generic signup method for mongodb
exports.signup = function(req, res, callback){
    var hash = '';
    var authenticationString = '';
    var authenticationStringLower = '';
    var firstName = '';
    var lastName = '';
    var name = '';
    var anName = '';
    var authorizationLevels = 300;
    var prefix = null;

    //get the prefix
    if (req.body.Prefix) prefix = req.body.Prefix;

    //organize the user string and user string lower
    if (req.body.AuthenticationString){
        authenticationString = req.body.AuthenticationString;
        authenticationStringLower = (req.body.AuthenticationString).toLowerCase();;
    }else{
        apiHelper.apiRes(req, res, null, null, null, 'Authentication String Required', 500, callback);
    }

    //organize the password
    if (req.body.Password){
        hash = cryptHelper.encrypt(req, res, req.body.Password);
    }else{
        apiHelper.apiRes(req, res, null, null, null, 'Password Required', 500, callback);
    }

    //organize the name
    name = stringHelper.toName(req, res, req.body.FirstName, req.body.LastName);
    firstName = req.body.FirstName;
    lastName= req.body.LastName;
    if(!name) apiHelper.apiRes(req, res, null, null, null, 'First or Last Name Required', 500, callback);

    //generate the an name from the name
    anName = slug(name);

    //organize the authorization levels
    if (req.body.AuthorizationLevels){
        authorizationLevels = req.body.AuthorizationLevels;
    }

    //check if user exists
    req, req.query = new Object();
    req.query.AuthenticationStringLower = authenticationStringLower;
    entityController.getEntity(req, res, true, function(getAuthResErr, getAuthRes, getAuthResCount){
        if (getAuthResCount > 0){
            apiHelper.apiRes(req, res, null, null, null, 'User Exists', 500, callback);
        }else{
            //Add the entity
            req, req.body = new Object();
            req.body.FirstName = firstName;
            req.body.LastName = lastName;
            req.body.Name = name;
            req.body.Type = 'U';
            req.body.Status = 'A';
            req.body.Approved = true;
            req.body.Disabled = false;
            req.body.Hash = hash;
            req.body.Prefix = prefix;
            req.body.AnName = anName;
            req.body.AuthorizationLevel = authorizationLevels;
            req.body.AuthenticationString = authenticationString;
            req.body.AuthenticationStringLower = authenticationStringLower;
            req.body.Hash = hash;

            entityController.addEntity(req, res, true, function(addEntityResErr, addEntityRes){
                if (!addEntityResErr){
                    apiHelper.apiRes(req, res, null, null, true, null, null, callback);
                }else{
                    apiHelper.apiRes(req, res, null, null, null, 'Unable to add entity', 500, callback);
                }
            });
        }
    })
}

//generic login method for mongodb
exports.login = function(req, res, callback){

    var authenticationString = '';
    var authenticationStringLower = '';
    var password = '';

    if (req.body.AuthenticationString){
        authenticationString = req.body.AuthenticationString;
        authenticationStringLower = authenticationString.toLowerCase();;
    }else{
        apiHelper.apiRes(req, res, null, null, null, 'Authentication String Required', 500, callback);
    }

    if (req.body.Password){
        password = req.body.Password;
    }else{
        apiHelper.apiRes(req, res, null, null, null, 'Password Required', 500, callback);
    }

    //get the user record
    req, req.query = new Object();
    req.query.AuthenticationStringLower = authenticationStringLower;
    entityController.getEntity(req, res, true, function(resGetEntityErr, resGetEntity, resGetEntityRowsReturned, resGetEntityTotalRows){
        if (resGetEntityRowsReturned > 0){
            //get the hash of the user
            var hash = resGetEntity[0].hash;
            var authenticated = cryptHelper.decrypt(req, res, password, hash);
            if (authenticated){
                apiHelper.apiRes(req, res, resGetEntityTotalRows, resGetEntityRowsReturned, resGetEntity, resGetEntityErr, null, callback);
            }else{
                apiHelper.apiRes(req, res, null, null, null, 'Authentication Failed', 500, callback);
            }
        }else{
            apiHelper.apiRes(req, res, null, null, null, 'User not found', 500, callback);
        }
    })
}

//Generic change password method for mongodb
exports.changePassword = function(req, res, callback){
    if (
        req.body.OldPassword &&
        req.body.NewPassword &&
        req.body.EntityId
    ){

        var oldPassword = req.body.OldPassword;
        var password = req.body.NewPassword;
        var entityId = req.body.EntityId;

        //check if the old password is
        async.waterfall([
            function(checkOldPasswordCallback){
                req, req.query = new Object();
                req.query.EntityId = entityId;
                entityController.getEntity(req, res, true, function(getEntityResErr, getEntityRes, getEntityResRowsReturned, getEntityResTotalRows){
                    if (!getEntityResErr && getEntityResRowsReturned){
                        var entity = getEntityRes[0];
                        if (!_.isEmpty(entity)){
                            var hash = entity.hash;
                            var oldPasswordCorrect = cryptHelper.decrypt(req, res, oldPassword, hash);
                            if (oldPasswordCorrect){
                                checkOldPasswordCallback();
                            }else{
                                checkOldPasswordCallback('Current password is invalid');
                            }
                        }
                    }else{
                        checkOldPasswordCallback(updateEntityResErr);
                    }
                })
            },
            function(changePasswordCallback){
                var newHash = cryptHelper.encrypt(req, res, password);
                //change the password
                req, req.body = new Object();
                req.body.EntityId = entityId;
                req.body.Hash = newHash;
                entityController.updateEntity(req, res, true, function(updateEntityResErr, updateEntityResRowsAffected, updateEntityRes){
                    if (!updateEntityResErr){
                        changePasswordCallback();
                    }else{
                        changePasswordCallback(updateEntityResErr);
                    }
                })
            }
        ],
        function(err){
            if (err){
                apiHelper.apiRes(req, res, null, null, null, err, 500, callback);
            }else{
                apiHelper.apiRes(req, res, null, null, true, null, null, callback);
            }
        })
    }else{
        apiHelper.apiRes(req, res, null, null, null, 'Current password and new password required', 500, callback);
    }
}
