/**
 * 启动文件
 * @author ydr.me
 * @create 2016年01月13日14:27:23
 * @update 2017年01月14日14:24:39
 */


'use strict';


var fs = require('fs');
var path = require('path');
var util = require('util');
var childProcess = require('child_process');

var pkg;
var configs;
var startTime = Date.now();
var NPM_REGISTRY = 'http://registry.npm.taobao.org';
var ROOT = path.join(__dirname, '..');
var WEBROOT_DEV = path.join(ROOT, 'webroot-dev');
var NPM_INSTALL = 'npm install --registry=' + NPM_REGISTRY;
var YARN_INSTALL = 'yarn install';
var APP_PATH = path.join(ROOT, 'app.js');
var execArgs = process.argv.slice(2).map(function (val) {
    var item = val.split('=');
    return {
        key: item[0].slice(2).toLowerCase(),
        val: item[1] || true
    };
});

/**
 * 查找运行参数
 * @param key
 * @returns {*}
 */
var findExecArg = function (key) {
    var list = execArgs.filter(function (item, index) {
        return key.toLowerCase() === item.key;
    });

    if (!list.length) {
        return null;
    }

    return list[0].val;
};
var isDebug = findExecArg('debug');

/**
 * 包装器
 * @param color
 * @param args
 */
var wrapper = function (color, args) {
    var str = util.format.apply(util, args);

    str = util.format('\x1b[' + util.inspect.colors[color][0] + 'm%s\x1b[' + util.inspect.colors[color][1] + 'm\n', str);
    process.stdout.write(str);
};


/**
 * 打印 danger 消息
 * @returns {*}
 */
var logDanger = function () {
    wrapper('red', arguments);
};


/**
 * 打印 success 消息
 * @returns {*}
 */
var logSuccess = function (msg) {
    wrapper('green', arguments);
};


/**
 * 打印 warning 消息
 * @returns {*}
 */
var logWarning = function (msg) {
    wrapper('yellow', arguments);
};


/**
 * 打印普通消息
 * @returns {*}
 */
var logNormal = function () {
    return process.stdout.write(util.format.apply(util, arguments) + '\n');
};


/**
 * 执行系统命令
 * @param cmds {Array|String} 命令数组
 * @param onSuccess {Function} 执行成功回调
 * @param [onError] {Function} 执行失败回调
 */
var exec = function (cmds, onSuccess, onError) {
    var command = cmds.join(' && ');

    logNormal(command);

    var point = 1;
    process.stdout.write('.');
    var interval = setInterval(function () {
        try {
            process.stdout.cursorTo(point);
        } catch (err) {
            // ignore
        }
        process.stdout.write('.');
        point++;
    }, 1000);

    childProcess.exec(command, function (err, stdout, stderr) {
        clearInterval(interval);

        try {
            process.stdout.clearLine();
        } catch (err) {
            // ignore
        }

        process.stdout.write('\n');

        if (err) {
            if (onError) {
                return onError(err);
            } else {
                logDanger(err.message);
                logDanger('[exit 1]');
                return process.exit(1);
            }
        }

        if (stderr) {
            logWarning(stderr);
        }

        logSuccess(stdout);
        onSuccess(stdout.trim());
    });
};


/**
 * 输出当前时间字符串
 * @returns {string}
 */
var now = function () {
    var d = new Date();
    var fix = function (n) {
        return (n < 10 ? '0' : '') + n;
    };

    return ''.concat(
        fix(d.getFullYear()),
        '-',
        fix(d.getMonth() + 1),
        '-',
        fix(d.getDate()),
        ' ',
        fix(d.getHours()),
        ':',
        fix(d.getMinutes()),
        ':',
        fix(d.getSeconds()),
        '.',
        fix(d.getMilliseconds())
    );
};


/**
 * 路径是否为文件夹
 * @param _path
 * @returns {*}
 */
var isDirectory = function (_path) {
    var stat;

    try {
        stat = fs.statSync(_path);
    } catch (err) {
        return false;
    }

    return stat.isDirectory();
};


/**
 * 更新代码
 * @param callback
 * @returns {*}
 */
var gitPull = function (callback) {
    logNormal('\n\n───────────[ 1/4 ]───────────');

    if (!isDirectory(path.join(ROOT, '.git'))) {
        logWarning('fatal: Not a git repository (or any of the parent directories): .git');
        return callback();
    }

    exec([
        'cd ' + ROOT,
        'git branch',
        'git pull'
    ], function () {
        logSuccess('git pull success');
        callback();
    });
};


/**
 * 使用 yarn 安装 node 模块
 * @param parent
 * @param callback
 */
var installNodeModulesUseYarn = function (parent, callback) {
    exec([
        'yarn --version'
    ], function () {
        removeFile(parent, 'npm-shrinkwrap.json');
        removeFile(parent, 'package-lock.json');
        logNormal('install node modules use yarn');
        exec([
            'cd ' + parent,
            YARN_INSTALL
        ], function () {
            callback(null);
        });
    }, callback);
};


/**
 * 使用 NPM 安装 node 模块
 * @param parent
 * @param callback
 */
var installNodeModulesUseNPM = function (parent, callback) {
    removeFile(parent, 'yarn.lock');
    logNormal('install node modules use NPM');
    exec([
        'cd ' + parent,
        NPM_INSTALL
    ], callback);
};


/**
 * 安装 Node 模块
 * @param type
 * @param callback
 */
var installNodeModules = function (type, callback) {
    var parent = [ROOT, WEBROOT_DEV][type];
    installNodeModulesUseYarn(parent, function (err) {
        if (err) {
            installNodeModulesUseNPM(parent, callback);
        } else {
            callback();
        }
    });
};


/**
 * 移除某个文件
 * @param parent
 * @param filename
 */
var removeFile = function (parent, filename) {
    var file = path.join(parent, filename);
    try {
        logNormal('rm', file);
        fs.unlinkSync(file);
    } catch (err) {
        // ignore
    }
};


/**
 * 更新后端模块
 * @param callback
 */
var installWebserverModules = function (callback) {
    logNormal('\n\n───────────[ 2/4 ]───────────');

    installNodeModules(0, function () {
        logSuccess('install webserver modules success');
        callback();
    });
};


/**
 * 更新前端模块
 * @param callback
 * @returns {*}
 */
var installFrontModules = function (callback) {
    logNormal('\n\n───────────[ 3/4 ]───────────');

    if (configs.env !== 'local') {
        logNormal('ignore front modules');
        return callback();
    }

    installNodeModules(1, function () {
        logSuccess('install front modules success');
        callback();
    });
};


/**
 * 本地启动
 * @param callback
 */
var startLocal = function (callback) {
    var supervisor = require('supervisor');
    var args = [];

    args.push('--watch');
    args.push(path.join(ROOT, 'webserver'));
    args.push('--extensions');
    args.push('js,md');
    args.push(APP_PATH);
    supervisor.run(args);
    callback();
};


/**
 * debug 启动
 * @param callback
 */
var startDebug = function (callback) {
    require('../app.js');
    callback();
};


/**
 * pm2 启动
 * @param callback
 */
var startPM2 = function (callback) {
    var pm2 = require('../pm2.json');

    exec([
        'pm2 start pm2.json',
        'pm2 show ' + pm2.name
    ], callback);
};


/**
 * 启动
 */
var start = function () {
    logNormal('\n\n───────────[ 4/4 ]───────────');

    var done = function () {
        logNormal('');
        logSuccess('past ' + (Date.now() - startTime) + 'ms');
        logNormal('');
    };

    if (isDebug) {
        startDebug(function () {
            logSuccess('debug start success');
            done();
        });
    } else if (configs.env === 'local') {
        startLocal(function () {
            logSuccess('listen changing success');
            done();
        });
    } else {
        startPM2(function () {
            logSuccess('pm2 start success');
            done();
        });
    }
};


// ======================================================================
// ======================================================================
// ======================================================================


// 更新代码安装模块并启动
gitPull(function () {
    pkg = require('../package.json');
    configs = require('../configs.js');
    NPM_INSTALL += configs.env === 'local' ? '' : ' --production';
    YARN_INSTALL += configs.env === 'local' ? '' : ' --production';

    installWebserverModules(function () {
        installFrontModules(function () {
            start();
        });
    });
});


