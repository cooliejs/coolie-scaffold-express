/**
 * mongoose 连接
 * @author ydr.me
 * @create 2014-11-22 12:35
 */

'use strict';


var mongoose = require('mongoose');
var fun = require('blear.utils.function');

var configs = require('../configs');

module.exports = function (next, app) {
    var complete = fun.once(function (err) {
        if (err) {
            return next(err, app);
        }

        require('../models/example');
        next(err, app);
    });

    mongoose.connect(configs.mongodb, {
        useNewUrlParser: true
    }, complete);
};


