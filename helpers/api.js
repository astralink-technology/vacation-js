/*
 * AST NodeJS API Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 * Added support for returning rows returned as total rows returned when user did not put the skip and limit
 * Fixed error in getRes on undefined length
 *
 */

exports.apiRes = function(req, res, totalRows, rowsReturned, data, errorDesc, errorCode, callback){
    var error = false;
    if (!totalRows) totalRows = rowsReturned;
    if (errorDesc) error = true;
    if (callback){
        var result = new Object();
        result.TotalRows = totalRows;
        result.RowsReturned = rowsReturned;
        result.Data = data;
        result.Error = error;
        result.ErrorDesc = errorDesc;
        result.ErrorCode = errorCode;
        callback(result);
    }else{
        res.json({
            TotalRows : totalRows,
            RowsReturned : rowsReturned,
            Data : data,
            Error : error,
            ErrorDesc : errorDesc,
            ErrorCode: errorCode
        });
    }
}

exports.updateRes = function (req, res, err, data, numberAffected, callback){
    if(callback){
        callback(err, numberAffected, data);
    }else {
        if (err){
            res.json({
                RowsReturned : null,
                Data : null,
                Error : true,
                ErrorDesc : err,
                ErrorCode: 500
            });
        }else{
            res.json({
                RowsReturned : null,
                Data : data,
                Error : false,
                ErrorDesc : null,
                ErrorCode: null
            });
        }
    }
}

exports.getRes = function (req, res, err, data, count, callback){
    var dataLength = 0;
    if (data) {
        dataLength = data.length;
    };
    if (count){
        if(callback){
            callback(err, data, dataLength, count);
        }else {
            if (err){
                res.json({
                    TotalRows : null
                    , RowsReturned : null
                    , Data : null
                    , Error : true
                    , ErrorDesc : err
                    , ErrorCode: 500
                });
            }else{
                res.json({
                    TotalRows : count
                    , RowsReturned : dataLength
                    , Data : data
                    , Error : false
                    , ErrorDesc : null
                    , ErrorCode: null
                });
            }
        }
    }else{
        if(callback){
            callback(err, data, dataLength, count);
        }else {
            if (err){
                res.json({
                    TotalRows : null
                    , RowsReturned : null
                    , Data : null
                    , Error : true
                    , ErrorDesc : err
                    , ErrorCode: 500
                });
            }else{
                res.json({
                    TotalRows : dataLength
                    , RowsReturned : dataLength
                    , Data : data
                    , Error : false
                    , ErrorDesc : null
                    , ErrorCode: null
                });
            }
        }
    }

}
exports.addRes = function (req, res, err, data, callback){
    if(callback){
        callback(err, data);
    }else {
        if (err){
            res.json({
                RowsReturned : null,
                Data : null,
                Error : true,
                ErrorDesc : err,
                ErrorCode: 500
            });
        }else{
            res.json({
                RowsReturned : null,
                Data : data,
                Error : false,
                ErrorDesc : null,
                ErrorCode: null
            });
        }
    }
}

exports.deleteRes = function (req, res, err, numberRemoved, callback){
    if(callback){
        callback(err, numberRemoved);
    }else {
        if (err) {
            res.json({
                RowsReturned: null,
                Data: null,
                Error: true,
                ErrorDesc: err,
                ErrorCode: 500
            });
        } else {
            res.json({
                RowsReturned: numberRemoved,
                Data: true,
                Error: false,
                ErrorDesc: null,
                ErrorCode: null
            });
        }
    }
}
