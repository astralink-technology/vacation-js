/*
 * AST Core Access API Mongo
 *
 * Copyright 2015 Astralink Technology
 * Author Sonia
 *
 * VERSION 2.1.2
 *
 * Added API Options
 * Re-modelled access
 * Populated device, entity and door
 *
 */

var mongoose = require('mongoose');
var moment = require('moment');
var apiHelper = _require('/helpers/api');
var dateTimeHelper = _require('/helpers/dateTime');
var vacationModel = _require('/models/vacation');

var getVacation = exports.getVacation = function(req, res, bypass, callback, apiOptions) {
        var pageSize = null;
        var skipSize = null;

        var queryParams = new Object();

        //key parameters
        if(req.query.Name) queryParams.name = req.query.Name;
        if(req.query.Type) queryParams.type = req.query.Type;
        if(req.query.Year) queryParams.year = req.query.Year;
        if(req.query.Month) queryParams.month = req.query.Month;
        if(req.query.Days) queryParams.days = req.query.Days;
        if(req.query.Country) queryParams.country = req.query.Country;
        if(req.query.CountryCode) queryParams.country_code = req.query.CountryCode;

        //paging parameters
        if(req.query.PageSize) pageSize = req.query.PageSize;
        if(req.query.SkipSize) skipSize = req.query.SkipSize;

        //additional options
        var options = new Object();
        if(apiOptions)  options = apiOptions;

        //sort options
        var sort = new Object();
        if(options.sort)  sort = options.sort;

        //fields selection options
        var vacationFields = new Object();

        vacationFields.__v = 0;

        if(options.vacationFields) vacationFields = options.vacationFields;

        //prior to the query params, users extend parameters
        if(options.queryParms)  _.extend(queryParams, options.queryParms);

        //count the total number of rows
        mongodb.model('vacation')
            .find(queryParams)
            .select(vacationFields)
            .skip(skipSize)
            .limit(pageSize)
            .sort(sort)
            .exec(function(err, data){
               if(pageSize || skipSize) {
                   mongodb.model('vacation').count(queryParams, function(err, count){
                       apiHelper.getRes(req, res, err, data, count, callback);
                   })
               }else {
                   apiHelper.getRes(req, res, err, data, null, callback);
               }
            });
};