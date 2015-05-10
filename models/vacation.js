/*
 * AST Vacation Model MONGO
 *
 * Copyright 2015 Astralink Technology
 * Author Shi Wei
 *
 * VERSION 2.1.2
 *
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var vacationSchema = new Schema({
    name : {type: String, default : null}
    , type : {type: String, default : null}
    , year : {type: Number, default : null}
    , month : {type: Number, default : null}
    , days : {type: Number, default : null}
    , country : {type: String, default : null}
    , country_code : {type: String, default : null}
});

mongoose.model('vacation', vacationSchema, 'vacation');