/**
 * @file 节流函数
 * @author zhujl
 */
define(function (require, exports, module) {

    'use strict';

    /**
     * 节流调用
     *
     * @param {Function} fn 需要节制调用的函数
     * @param {number=} wait 调用的时间间隔，默认 50ms
     * @return {Function}
     */
    return function (fn, wait) {

        wait = $.type(wait) === 'number' ? wait : 50;

        var timer;

        return function () {

            if (timer) {
                return;
            }

            var args = arguments;

            timer = setTimeout(
                        function () {
                            timer = null;
                            fn.apply(null, $.makeArray(args));
                        },
                        wait
                    );

        };
    };

});