/**
 * error
 * @author ydr.me
 * @create 2016-01-13 21:54
 */


'use strict';

var string = require('blear.utils.string');

var reAPI = /^\/api\//;

// 解析 404
exports.clientError = function clientError(req, res, next) {
    var isAPI = reAPI.test(req.originalUrl);
    var errCode = 404;
    var errMsg = 'Page Not Found';

    if (isAPI) {
        return res.api(errCode, errMsg);
    }

    res.status(errCode);
    res.send(
        '<!doctype html>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width,user-scalable=no,maximum-scale=1.0,minimum-scale=1.0,minimal-ui">' +
        '<style>' +
        'body {' +
        /****/'background: #b54646;' +
        /****/'color: #fff;' +
        /****/'font-size: 16px;' +
        /****/'line-height: 1.6;' +
        '}' +
        '</style>' +
        '<h1>' + errCode + ' Error</h1>' +
        '<pre>' + string.escapeHTML(errMsg) + '</pre>' +
        ''
    );
};


// 解析 500
exports.serverError = function serverError(err, req, res, next) {
    var isAPI = reAPI.test(req.originalUrl);
    var errCode = err.code || 500;
    var errMsg = err.message || '网络错误';

    if (isAPI) {
        return res.api(errCode, errMsg);
    }

    res.status(500);
    res.send(
        '<!doctype html>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width,user-scalable=no,maximum-scale=1.0,minimum-scale=1.0,minimal-ui">' +
        '<style>' +
        'body {' +
        /****/'background: #b54646;' +
        /****/'color: #fff;' +
        /****/'font-size: 16px;' +
        /****/'line-height: 1.6;' +
        '}' +
        '</style>' +
        '<h1>' + errCode + ' Error</h1>' +
        '<pre>' + string.escapeHTML(errMsg) + '</pre>' +
        ''
    );
};




