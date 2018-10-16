/**
 * 配置文件
 * @author ydr.me
 * @create 2016年01月13日14:30:30
 */


'use strict';

var path = require('path');
var pkg = require('../package.json');

var env = getEnvironment();
var webrootEnv = env === 'development' ? 'dev' : 'pro';
var root = path.join(__dirname, '..');
var port = 3456;

module.exports = {
    port: port,
    env: env,
    pkg: pkg,
    root: root,
    webroot: path.join(root, './webroot-' + webrootEnv),
    redis: {
        development: {
            url: 'redis://127.0.0.1:6379',
            db: 0,
            pass: 'REDIS_PASSWORD',
            prefix: pkg.name + ':'
        },
        test: {
            url: 'redis://127.0.0.1:6379',
            db: 0,
            pass: 'REDIS_PASSWORD',
            prefix: pkg.name + ':'
        },
        production: {
            url: 'redis://127.0.0.1:6379',
            db: 0,
            pass: 'REDIS_PASSWORD',
            prefix: pkg.name + ':'
        }
    }[env],
    redisKey: {
        storage: pkg.name + ':storage:',
        session: pkg.name + ':session:'
    },
    cookie: {
        // cookie 密钥，必要时修改
        secret: 'gU5*G^6h',
        // 1d
        maxAge: 24 * 60 * 60 * 1000,
        sessionName: 's' + port
    },
    logLevel: {
        development: ['log', 'info', 'warn', 'error'],
        test: ['log', 'info', 'warn', 'error'],
        production: ['warn', 'error']
    }[env],
    api: 'http://api.com',
    fundebug: {
        url: 'https://js.fundebug.cn/fundebug.1.1.2.min.js',
        key: 'API_KEY'
    }
};



// ====================================================

/**
 * 获取当前环境变量
 * @returns {string}
 */
function getEnvironment() {
    var DEVELOPMENT_ENV = 'development';
    var TEST_ENV = 'test';
    var PRODUCTION_ENV = 'production';
    var env = process.env.NODE_ENV || process.env.ENVIRONMENT || DEVELOPMENT_ENV;

    if (/test/.test(env)) {
        env = TEST_ENV;
    } else if (/pro/.test(env)) {
        env = PRODUCTION_ENV;
    } else {
        env = DEVELOPMENT_ENV;
    }

    return (process.env.NODE_ENV = env);
}

