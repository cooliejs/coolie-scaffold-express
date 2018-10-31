/**
 * 主控制器
 * @author ydr.me
 * @create 2016-01-13 14:45
 */


'use strict';

var pkg = require('../../../package.json');

exports.getHome = function (app) {
    return function (req, res, next) {
        res.render('index.html', {
            pkg: pkg
        });
    };
};



