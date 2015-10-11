/**
 * @file 天偏移
 * @author musicode
 */
define(function (require, exports, module) {

    'use strict';

    var hourOffset = require('./hourOffset');

    return function (date, offset) {
        return hourOffset(date, offset * 24);
    };

});