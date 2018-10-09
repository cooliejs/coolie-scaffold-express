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
    var errMsg = '当前页面不存在哦';

    if (isAPI) {
        return res.api(errCode, errMsg);
    }

    res.status(404);
    res.send(errMsg);
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
        '<style>' +
        'body {' +
        'background: #b54646;' +
        'color: #fff;' +
        'font-size: 16px;' +
        'line-height: 1.6;' +
        '}' +
        '</style>' +
        '<h1>Error</h1>' +
        '<pre>' + string.escapeHTML(errMsg) + '</pre>' +
        '<pre>' + err.stack + '</pre>' +
        ''
    );
};




