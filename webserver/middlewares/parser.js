/**
 * 解析类中间件
 * @author ydr.me
 * @create 2016-01-13 15:11
 */


'use strict';

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var sessionParser = require('express-session');
var multer = require('multer');
var os = require('os');
var system = require('blear.node.system');
var console = require('blear.node.console');


var configs = require('../configs');


var upload = multer({
    dest: os.tmpdir()
});


// 解析 cookie
exports.parseCookie = function () {
    return cookieParser(configs.cookie.secret);
};


// 解析 session
exports.parseSession = function (redis) {
    return sessionParser({
        resave: true,
        rolling: true,
        saveUninitialized: true,
        cookie: configs.cookie,
        secret: configs.cookie.secret,
        name: configs.cookie.sessionName,
        store: redis ? redis.expressSessionStorage(sessionParser, configs.redisKey.session) : null
    });
};


// 解析完整 URL
exports.parseFullURL = function () {
    return function (req, res, next) {
        var protocol = req.headers['x-forwarded-scheme'] || req.protocol;
        req.$fullURL = protocol + '://' + req.headers.host + req.originalUrl;
        next();
    };
};


// 解析 IP
exports.parseIP = function () {
    return function (req, res, next) {
        if (req.session && req.session.$ip) {
            req.$ip = req.session.$ip;
            return next();
        }

        if (!req.headers['x-forwarded-for'] && configs.env === 'development') {
            req.headers['x-forwarded-for'] = '127.0.0.1';
        }

        system.remoteIP(req, function (ip) {
            req.$ip = ip;
            req.session && (req.session.$ip = ip);
            next();
        });
    };
};


// 解析访问信息
exports.parseAccess = function () {
    return function (req, res, next) {
        console.infoWithTime(req.$ip, req.method, req.$fullURL);
        next();
    };
};


// 解析 application/json
exports.parseApplicationJSON = function () {
    return bodyParser.json({
        strict: true,
        limit: '1mb',
        type: 'json'
    });
};


// 解析 application/x-www-form-urlencoded
exports.parseApplicationXwwwFormUrlencoded = function () {
    return bodyParser.urlencoded({
        extended: false
    });
};


// 解析 text/xml
exports.parseTextXML = function () {
    return bodyParser.raw({
        type: 'text/xml'
    });
};


// 解析 multipart/form-data text
exports.parseMultipartFormDataOfText = function () {
    return upload.none();
};


// 解析 multipart/form-data file
exports.parseMultipartFormDataOfFile = function (fileName) {
    return upload.single(fileName || 'file');
};


