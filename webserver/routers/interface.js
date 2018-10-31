/**
 * 接口路由
 * @author ydr.me
 * @create 2018-10-31 18:05
 * @update 2018-10-31 18:05
 */


'use strict';

var ctrlExample= require('../controllers/interface/example');

module.exports = function (app) {
    app.get('/api/example', ctrlExample.random(app));
};


