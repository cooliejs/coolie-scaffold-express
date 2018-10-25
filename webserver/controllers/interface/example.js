/**
 * 示例
 * @author ydr.me
 * @create 2016-05-27 17:25
 */


'use strict';


exports.random = function (app) {
    return function (req, res, next) {
        res.api(Math.random());
    };
};
