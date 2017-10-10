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

var START_TIME = Date.now();
var NPM_REGISTRY = 'http://registry.npm.taobao.org';
var ROOT = path.join(__dirname, '..');
var WEBROOT_DEV = path.join(ROOT, 'webroot-dev');
var NPM_INSTALL = 'npm install --registry=' + NPM_REGISTRY;
var YARN_INSTALL = 'yarn install --registry=' + NPM_REGISTRY;
var APP_PATH = path.join(ROOT, 'app.js');
var PKG;
var CONFIGS;
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
 * @param thisLine
 */
var wrapper = function (color, args, thisLine) {
    var str = util.format.apply(util, args);
    var newLine = thisLine ? '' : '\n';

    str = util.format('\x1b[' + util.inspect.colors[color][0] +
        'm%s\x1b[' + util.inspect.colors[color][1] + 'm' + newLine, str);
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
 * loading
 * @type {{start, end}}
 */
var loading = (function () {
    var point = 0;
    var interval;
    var loadingList = ['-', '\\', '|', '/'];

    return {
        start: function () {
            process.stdout.write(loadingList[0]);
            interval = setInterval(function () {
                point++;
                point = point % loadingList.length;
                try {
                    process.stdout.cursorTo(0);
                } catch (err) {
                    // ignore
                }
                process.stdout.write(loadingList[point]);
            }, 90);
        },
        end: function () {
            clearInterval(interval);
            point = 0;

            try {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
            } catch (err) {
                // ignore
            }
        }
    };
}());

/**
 * 执行命令
 * @param cmdList {Array} 命令数组
 * @param onSuccess {Function} 执行成功回调
 * @param [onError] {Function} 执行失败回调
 */
var exec = function (cmdList, onSuccess, onError) {
    var cmdStr = cmdList.join(' && ');
    var cp = childProcess.exec(cmdStr, {
        cwd: ROOT
    });

    logNormal('[exec]', cmdStr);
    loading.start();

    cp.stdout.on('data', function (chunk) {
        loading.end();
        wrapper('green', [chunk.toString()], true);
        loading.start();
    });

    cp.stderr.on('data', function (chunk) {
        loading.end();
        wrapper('yellow', [chunk.toString()], true);
        loading.start();
    });

    cp.on('close', function (code) {
        loading.end();

        if (code !== 0) {
            if (onError) {
                return onError(new Error(code));
            } else {
                logDanger('[exit ' + code + ']');
                return process.exit(-1);
            }
        }

        onSuccess();
    });

    return cp;
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
    }, function (err) {
        callback(err);
    });
};


/**
 * 使用 NPM 安装 node 模块
 * @param parent
 * @param callback
 */
var installNodeModulesUseNPM = function (parent, callback) {
    removeFile(parent, 'yarn.lock');
    logNormal('install node modules use NPM');
    var cmds = [
        'cd ' + parent,
        NPM_INSTALL
    ];

    if (CONFIGS.env === 'local') {
        cmds.push('npm shrink');
    }

    exec(cmds, function () {
        callback();
    });
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

    if (CONFIGS.env !== 'local') {
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
        logSuccess('Done in ' + (Date.now() - START_TIME) / 1000 + 's');
        logNormal('');
    };

    if (isDebug) {
        startDebug(function () {
            logSuccess('debug start success');
            done();
        });
    } else if (CONFIGS.env === 'local') {
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
    PKG = require('../package.json');
    CONFIGS = require('../configs.js');
    NPM_INSTALL += CONFIGS.env === 'local' ? '' : ' --production';
    YARN_INSTALL += CONFIGS.env === 'local' ? '' : ' --production --pure-lockfile';

    installWebserverModules(function () {
        installFrontModules(function () {
            start();
        });
    });
});



