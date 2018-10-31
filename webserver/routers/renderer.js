/**
 * 渲染路由
 * @author ydr.me
 * @create 2018-10-31 18:05
 * @update 2018-10-31 18:05
 */


'use strict';

var ctrlMain = require('../controllers/renderer/main');

module.exports = function (app) {
    app.get('/', ctrlMain.getHome(app));
};


