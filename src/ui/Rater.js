/**
 * @file 星级评分
 * @author zhujl
 */
define(function (require, exports, module) {

    'use strict';

    /**
     * 星级评分
     *
     * @constructor
     * @param {Object} options
     * @property {jQuery} options.element 主元素
     * @property {number} options.value 当前星级
     * @property {number} options.total 星星总数
     * @property {string} options.onIcon 星星选中状态的图标 class
     * @property {string} options.offIcon 星星未选中状态的图标 class
     * @property {Object=} options.hints key 是星星对应的值，value 是提示文本，如下：
     *                               {
     *                                   '1': '非常差',
     *                                   '2': '差',
     *                                   '3': '一般',
     *                                   '4': '好',
     *                                   '5': '非常好'
     *                               }
     * @property {boolean=} options.readOnly 是否只读
     * @property {Function=} options.onSelect 选中星星触发
     * @example
     * var rater = new Rater({
     *     element: $('.rater'),
     *     value: 2,                      // 当前选中 2 颗星
     *     total: 5,                      // 总共有 5 颗星
     *     onIcon: 'icon on',
     *     offIcon: 'icon off'
     *     onSelect: function (value) {
     *         console.log('select ' + value);
     *     }
     * });
     */
    function Rater(options) {
        $.extend(this, Rater.defaultOptions, options);
        this.init();
    }

    Rater.prototype = {

        constructor: Rater,

        /**
         * 初始化
         */
        init: function () {
            var me = this;

            var html = [ ];
            for (var i = 1, len = me.total; i <= len; i++) {
                html.push('<i class="');
                html.push(i <= me.value ? me.onIcon : me.offIcon);
                html.push('" data-value="' + i + '"');
                if (me.hints[i]) {
                    html.push(' title="' + me.hints[i] + '"')
                }
                html.push('></i>');
            }

            me.element.html(html.join(''));

            if (typeof me.onSelect === 'function') {
                me.onSelect(me.value);
            }

            if (!me.readOnly) {
                me.element
                  .on('mouseenter', 'i', me, onMouseEnter)
                  .on('mouseleave', 'i', me, onMouseLeave)
                  .on('click', 'i', me, onClick);
            }
        },

        /**
         * 获得当前星级
         *
         * @return {number}
         */
        getValue: function () {
            return this.value || 0;
        },

        /**
         * 设置当前星级
         *
         * @param {number} value
         */
        setValue: function (value) {

            var me = this;

            if (value === me.value || me.readOnly) {
                return;
            }

            refresh(me, value);
            me.value = value;

            if (typeof me.onSelect === 'function') {
                me.onSelect(value);
            }
        },

        /**
         * 销毁对象
         */
        dispose: function () {
            if (!this.readOnly) {
                this.element
                    .off('mouseenter', onMouseEnter)
                    .off('mouseleave', onMouseLeave)
                    .off('click', onClick);
            }
        }
    };


    /**
     * 默认参数
     *
     * @static
     * @type {Object}
     */
    Rater.defaultOptions = {
        readOnly: false,
        hints: { }
    };


    /**
     * 鼠标移入
     *
     * @inner
     * @param {Event} e
     */
    function onMouseEnter(e) {
        var rater = e.data;
        var target = $(e.target);
        refresh(rater, target.data('value'));
    }

    /**
     * 鼠标移出
     *
     * @inner
     * @param {Event} e
     */
    function onMouseLeave(e) {
        var rater = e.data;
        refresh(rater, rater.value);
    }

    /**
     * 鼠标点击
     *
     * @inner
     * @param {Event} e
     */
    function onClick(e) {
        var rater = e.data;
        var target = $(e.target);
        rater.setValue(target.data('value'));
    }

    /**
     * 刷新星星的状态
     *
     * @inner
     * @param {Rater} rater
     * @param {value} value
     */
    function refresh(rater, value) {
        var elements = rater.element.find('i');
        for (var i = 1; i <= rater.total; i++) {
            elements[i - 1].className = i <= value ? rater.onIcon : rater.offIcon;
        }
    }


    return Rater;

});
