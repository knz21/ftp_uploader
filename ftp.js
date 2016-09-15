var FtpClient = require('ftp');

exports.upload = function (fileName, callback) {
    var c = new FtpClient();
    c.connect(getFtpInfo());
    c.on('ready', function () {
        var remotePath = process.env.REMOTE_PATH || require('./settings').remotePath;
        c.put(fileName, remotePath + fileName, function (err) {
            console.log('uploaded:' + fileName + ', ' + new Date().toLocaleString());
            if (err) throw err;
            if (callback) callback();
            c.end();
        });
    });
};

exports.load = function (callback) {
    var c = new FtpClient();
    c.connect(getFtpInfo());
    c.on('ready', function () {
        var remotePath = process.env.REMOTE_PATH || require('./settings').remotePath;
        c.cwd(remotePath, function (err, currentDir) {
            if (err) throw err;
            c.list(function (err, list) {
                callback(list);
            });
        });
    });
};

function getFtpInfo() {
    var settings;
    return {
        host: process.env.FTP_HOST || getSettings().ftpHost,
        port: process.env.FTP_PORT || getSettings().ftpPort,
        user: process.env.FTP_USER || getSettings().ftpUser,
        password: process.env.FTP_PASS || getSettings().ftpPass
    };

    function getSettings() {
        if (!settings) {
            settings = require('./settings');
        }
        return settings;
    }
}