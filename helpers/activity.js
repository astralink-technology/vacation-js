/*
 * AST NodeJS Activity Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 0.1.0
 *
 *
 */

exports.doorAccessActivity = function (action, door){
    if (action == 'I'){
        action = 'clocked in';
    }else if (action == 'O'){
        action = 'clocked out';
    }else if (action == 'N'){
        action = 'entered';
    }else if (action == 'X'){
        action = 'exited';
    }else{
        action = 'tap and accessed';
    }

    var activityMessage = action;
    if (door) activityMessage += ' via ' + door;

    return activityMessage;
}
