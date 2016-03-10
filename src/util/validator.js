/**
 * @file 验证器（DOM 无关）
 * @author musicode
 */
define(function (require, exports, module) {

    'use strict';

    var allPromises = require('../function/allPromises');

    /**
     * 内置常用规则
     *
     * @inner
     * @type {Object}
     */
    var buildInRules = {

        required: function (data, rules) {
            if (data.value === 0 || data.value) {
                return true;
            }
            else if (rules.required) {
                return false;
            }
        },

        pattern: function (data, rules) {
            var pattern = rules.pattern;
            if ($.type(pattern) === 'string') {
                pattern = exports.buildInPatterns[ pattern ];
            }
            if (pattern instanceof RegExp) {
                return pattern.test(data.value);
            }
        },

        minlength: function (data, rules) {
            if ($.isNumeric(rules.minlength)) {
                return data.value.length >= + rules.minlength;
            }
        },

        maxlength: function (data, rules) {
            if ($.isNumeric(rules.maxlength)) {
                return data.value.length <= + rules.maxlength;
            }
        },

        min: function (data, rules) {
            if ($.isNumeric(rules.min)) {
                return data.value >= + rules.min;
            }
        },

        max: function (data, rules) {
            if ($.isNumeric(rules.max)) {
                return data.value <= + rules.max;
            }
        },

        step: function (data, rules) {
            var min = rules.min;
            var step = rules.step;
            if ($.isNumeric(min) && $.isNumeric(step)) {
                return (data.value - min) % step === 0;
            }
        },

        equals: function (data, rules, all) {
            var equals = rules.equals;
            if (equals) {
                return data.value === all[ equals ].value;
            }
        }

    };

    /**
     * 内置常用正则
     *
     * @type {Object}
     */
    exports.buildInPatterns = {
        int: /^\d+$/,
        number: /^-?[\d.]*$/,
        positive: /^[\d.]*$/,
        negative: /^-[\d.]*$/,
        char: /^[\w\u2E80-\u9FFF]+$/,
        url: /^(?:(?:0\d{2,3}[- ]?[1-9]\d{6,7})|(?:[48]00[- ]?[1-9]\d{6}))$/,
        tel: /^(?:(?:0\d{2,3}[- ]?[1-9]\d{6,7})|(?:[48]00[- ]?[1-9]\d{6}))$/,
        mobile: /^1[3-9]\d{9}$/,
        email: /^(?:[a-z0-9]+[_\-+.]+)*[a-z0-9]+@(?:([a-z0-9]+-?)*[a-z0-9]+.)+([a-z]{2,})+$/i
    };

    /**
     *
     * @param {Object} data 待验证的数据，格式如下：
     *                      {
     *                          key1: {
     *                              value: '', // value 需要经过 trim
     *                              extra      // 扩展数据，比如 DOM 元素
     *                          }
     *                      }
     *
     * @param {Object} rules 验证规则，格式如下：
     *                       {
     *                           key1: {
     *                               before: function () {
     *                                  // 返回 false 可拦截 key1 的后续验证
     *                               },
     *                               after: function () {
     *                                  // 验证完做一些处理
     *                               },
     *                               // 如果对顺序有要求，可配置 sequence
     *                               // 否则取决于遍历 rules 对象的顺序
     *                               sequence: [ 'required', 'pattern', 'customRule' ],
     *                               rules: {
     *                                   required: true,
     *                                   pattern: 'buildIn' or /xx/,
     *                                   customRule: function () {
     *                                      // 返回值：
     *                                      // true -> 同步验证通过
     *                                      // false -> 同步验证失败
     *                                      // promise -> 异步校验，异步值和同步返回值作用相同
     *                                      // 其他 -> 跳过
     *                                   }
     *                               },
     *                               errors: {
     *                                   required: 'required error',
     *                                   pattern: 'pattern error',
     *                                   customRule: 'customRule error'
     *                               }
     *                           }
     *                       }
     */
    exports.validate = function (data, rules) {

        var list = [ ];
        var promises = [ ];

        $.each(
            data,
            function (key, item) {

                var rule = rules[ key ];

                if (!rule) {
                    return;
                }

                var result = $.extend({ }, item);

                if ($.isFunction(rule.before)
                    && rule.before(data) === false
                ) {
                    list.push(result);
                    return;
                }


                var failedRule;

                var promiseNames = [ ];
                var promiseValues = [ ];

                var validate = function (name, value) {
                    if (!$.isFunction(value)) {
                        value = buildInRules[ name ];
                    }
                    if ($.isFunction(value)) {
                        var validateComplete = function (result) {
                            if (result === false) {
                                failedRule = name;
                            }
                            else if (result && $.isFunction(result.then)) {
                                result.then(validateComplete);
                                promiseNames.push(name);
                                promiseValues.push(result);
                            }
                            else if ($.type(result) !== 'boolean') {
                                result = false;
                            }
                            return result;
                        };
                        return validateComplete(
                            value(item, rule.rules, data)
                        );
                    }
                };

                if ($.isArray(rule.sequence)) {
                    $.each(
                        rule.sequence,
                        function (index, name) {
                            return validate(name, rule.rules[name]);
                        }
                    );
                }
                else {
                    $.each(
                        rule.rules,
                        function (name, value) {
                            return validate(name, value);
                        }
                    );
                }

                var extend = function () {

                    if (failedRule) {
                        result.rule = failedRule;
                        result.error = rule.errors[ failedRule ];
                    }

                    if ($.isFunction(rule.after)) {
                        rule.after(result);
                    }

                };

                var index;

                if (promiseValues.length) {

                    var promise =

                    allPromises(promiseValues)
                        .then(function (values) {

                            $.each(
                                values,
                                function (index, value) {
                                    if (value === false) {
                                        failedRule = promiseNames[ index ];
                                        return false;
                                    }
                                }
                            );

                            extend();
                            list[ index - 1 ] = result;

                        });

                    index = list.push(promise);

                    promises.push(promise);

                }
                else {
                    extend();
                    list.push(result);
                }

            }
        );

        if (promises.length) {
            return allPromises(promises)
                .then(function () {
                    return list;
                });
        }

        return list;


    };

});