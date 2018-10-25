/**
 * 控制台服务
 * @author ydr.me
 * @create 2016-03-03 18:02
 */


'use strict';

var console = require('blear.node.console');

var configs = require('../configs');

module.exports = function (next) {
    // 控制台设置
    console.config({
        colorful: 'development' === configs.env,
        level: configs.logLevel
    });

    next();
};



