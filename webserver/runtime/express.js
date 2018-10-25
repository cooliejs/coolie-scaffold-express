/**
 * run express
 * @author ydr.me
 * @create 2015-04-29 14:09
 */


'use strict';

var express = require('express');
var path = require('blear.node.path');
var template = require('blear.node.template');

var configs = require('../configs');


module.exports = function (next) {
    var app = express();

    app.set('env', configs.env);
    app.set('port', configs.port);
    app.set('views', path.join(configs.webroot, 'views'));
    app.engine('html', template.express({
        cache: configs.env !== 'development'
    }));
    app.set('view engine', 'html');

    // 路由区分大小写，默认 disabled
    app.set('case sensitive routing', true);

    // 严格路由，即 /a/b !== /a/b/
    app.set('strict routing', false);

    app.set('jsonp callback name', 'callback');
    app.set('json spaces', 'development' === configs.env ? 4 : 0);
    app.set('view cache', 'development' !== configs.env);

    next(null, app);
};
