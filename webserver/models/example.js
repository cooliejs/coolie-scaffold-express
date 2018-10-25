/**
 * 文件描述
 * @author ydr.me
 * @create 2018-10-25 18:13
 * @update 2018-10-25 18:13
 */


'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    example: {
        type: String
    }
}, {
    // If set timestamps, mongoose assigns createdAt and updatedAt
    // fields to your schema, the type assigned is Date.
    timestamps: true
});

module.exports = mongoose.model('example', schema);



