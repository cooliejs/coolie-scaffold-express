/**
 * 路由
 * @author ydr.me
 * @created 2016-12-17 13:14:31
 */


'use strict';

var log = require('blear.node.log');
var expressResAPI = require('blear.express.res-api');
var expressResRender = require('blear.express.res-render');
var expressHttpMethodOverride = require('blear.express.http-method-override');
var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');

var configs = require('../configs');
var midParser = require('../middlewares/parser');
var midSafe = require('../middlewares/safe');
var midError = require('../middlewares/error');
var midLocals = require('../middlewares/locals');


module.exports = function (next, app) {
    var redis = app.redis;

    // 静态文件
    app.use('/', express.static(path.join(configs.root, 'public')));
    app.use('/static', express.static(path.join(configs.webroot, 'static')));
    app.use('/node_modules', express.static(path.join(configs.webroot, 'node_modules')));
    app.use(favicon(path.join(configs.webroot, 'favicon.ico')));

    // 前置中间件
    app.use(expressResAPI(app, {
        rewriteError: false
    }));
    app.use(expressResRender(app, {
        debug: configs.env !== 'production' ? 'debug': null
    }));
    app.use(expressHttpMethodOverride());
    app.use(midParser.parseFullURL());
    app.use(midParser.parseIP());
    app.use(midParser.parseAccess());
    app.use(midParser.parseCookie());
    app.use(midParser.parseSession(redis));
    app.use(midParser.parseApplicationJSON());
    app.use(midParser.parseApplicationXwwwFormUrlencoded());
    app.use(midParser.parseRedis(redis));
    app.use(midSafe.addUACompatibleHeader());
    app.use(midSafe.addFrameOptionsHeader());
    app.use(midLocals.$configs());
    app.use(midLocals.$url());
    app.use(midLocals.$ua());

    // 接口
    app.use('/api/example/', require('../controllers/api/example'));

    // 页面
    app.use('/', require('../controllers/render/main'));

    // 后置中间件
    app.use(log.expressMiddleware());
    app.use(midError.clientError);
    app.use(midError.serverError);

    // 监听端口
    app.listen(configs.port, function (err) {
        next(err, app);
    }).on('error', next);
};


