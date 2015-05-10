/*
 * AST NodeJS JSON Web Token Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 */

var jwt = require('jwt-simple');

exports.jwtEncode = function(req, res, payload, secret){
    var encodedPayload = jwt.encode(payload, secret);
    return encodedPayload;
}

exports.jwtDecode = function(req, res, token, secret){
    var payload = jwt.decode(token, secret);
    return payload;
}
