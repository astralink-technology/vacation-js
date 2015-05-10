/*
 * AST NodeJS Postgresql Connect
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 * Removed ConString to prevent error
 *
 */

var config = _require('/config/webConfig');
var pg = require('pg');
var mongoose = require('mongoose');

exports.connectAndQuery = function(req, res, queryString, variables, afterQueryFunction, tpAppName, tpUsername, tpPassword, tpHost, tpPort, tpDb, tpSsl){
    var dbConfig = config.dbConfig();
    var client = new pg.Client({
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.db,
        port: dbConfig.port,
        host: dbConfig.host,
        ssl: dbConfig.sslMode
    });

    //allow users to connect to third party database after user pass in the values.
    if (tpAppName && tpUsername && tpPassword && tpHost && tpPort && tpDb){
        client = new pg.Client({
            user: tpUsername,
            password: tpPassword,
            database: tpDb,
            port: tpPort,
            host: tpHost,
            ssl: tpSsl
        });
    }
    client.connect(function(err) {
        if(err) {
            console.log(err);
        }
        client.query(
            queryString
            , variables
            , function(err, result) {
                if(err) {
                    res.json({
                        RowsReturned : result,
                        Data : null,
                        Error : true,
                        ErrorDesc : err,
                        ErrorCode: 500
                    });
                    return;
                }else{
                    if(afterQueryFunction == 'noReturn'){
                        //do not return anything.
                        console.log('noReturn');
                    }else if (afterQueryFunction){
                        afterQueryFunction(result);
                    }else{
                        res.json({
                            RowsReturned : result.rows.length,
                            Data : result.rows,
                            Error : false,
                            ErrorDesc : null,
                            ErrorCode: null
                        });
                    }
                }
                client.end();
            });
    });
}

exports.connectAndQueryLite = function(req, res, queryString, variables){
    var dbConfig = config.dbConfig();
    var conString = dbConfig.appName + "://" +  dbConfig.username + ":" + dbConfig.password + "@" + dbConfig.host + ":" + dbConfig.port + "/" + dbConfig.db;

    var client = new pg.Client(conString);
    client.connect(function(err) {
        if(err) {
            console.log(err + " " + conString);
        }
        client.query(
            queryString
            , variables
            , function(err, result) {
                if(err) {
                    res.json(500);
                    return;
                }else{
                    res.json(result.rows);
                }
                client.end();
            });
    });
}

exports.lifeCareConnectAndQueryLite = function(req, res, queryString, variables){
    var dbConfig = config.dbConfig();
    var conString = dbConfig.appName + "://" +  dbConfig.username + ":" + dbConfig.password + "@" + dbConfig.host + ":" + dbConfig.port + "/" + dbConfig.db;

    var client = new pg.Client(conString);
    client.connect(function(err) {
        if(err) {
            console.log(err + " " + conString);
        }
        client.query(
            queryString
            , variables
            , function(err, result) {
                if(err) {
                    res.json(500);
                    return;
                }else{
                    res.json(result.rows);
                }
                client.end();
            });
    });
}
