/**
 * @file 周的第一天日期
 * @author musicode
 */
define(function (require, exports, module) {

    'use strict';

    var dateOffset = require('./dateOffset');

    return function (date, firstDay) {

        if ($.type(date) === 'number') {
            date = new Date(date);
        }

        var day = date.getDay();
        day = day >= firstDay ? day : (day + 7);

        return dateOffset(date, -1 * (day - firstDay));

    };

});