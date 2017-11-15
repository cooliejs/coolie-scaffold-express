/**
 * res.locals
 * @author ydr.me
 * @create 2016-06-01 10:37
 */


'use strict';


var url = require('blear.utils.url');
var random = require('blear.utils.random');


var configs = require('../../configs');


exports.$configs = function () {
    return function (req, res, next) {
        res.locals.$configs = configs;
        next();
    };
};


exports.$url = function () {
    return function (req, res, next) {
        res.locals.$url = url.parse(req.$fullURL, true);
        next();
    };
};


exports.$ua = function () {
    return function (req, res, next) {
        var ua = req.headers['user-agent'];
        var isMobile = /mobile|iphone|ipad|ipod|andorid/i.test(ua);
        var isWeixin = /MicroMessenger\b/i.test(ua);
        var isIOS = /iphone|ipod|ipad/i.test(ua);
        var isAOS = /android/i.test(ua);
        var isMac = /mac/i.test(ua);
        var isWin = /windows/i.test(ua);

        res.locals.$ua = {
            isMobile: isMobile,
            isWeixin: isWeixin,
            isIOS: isIOS,
            isAOS: isAOS,
            isMac: isMac,
            isWin: isWin
        };
        next();
    };
};


