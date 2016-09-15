var fs = require('fs');
var formidable = require('formidable');
var ftp = require('./ftp');

var contentType = {
    html: 'text/html',
    js: 'text/javascript',
    css: 'text/css'
};

exports.start = function (res) {
    startHome(res);
};

exports.submit = function (res, req) {
    var pass = '';
    req.setEncoding('utf8');
    req.on('data', function (data) {
        pass += data;
    });
    req.on('end', function () {
        res.writeHeader(certificate(pass) ? 200 : 403);
        res.end();
    });
};

exports.load = function (res, req) {
    var pass = '';
    req.setEncoding('utf8');
    req.on('data', function (data) {
        pass += data;
        if (certificate(pass)) {
            loadList(res);
        } else {
            errorEnd(res, 'certification error!!!');
        }
    });
};

function loadList(res) {
    ftp.load(function (data) {
        if (!data || data.length === 0) {
            return;
        }
        var fileUrl = process.env.FILE_URL || require('./settings').fileUrl;
        var fileSet = data.map(function (file) {
            return { date: file.date, name: fileUrl + file.name, size: file.size, isFile: file.name !== '.' };
        });
        fileSet.sort(function (a, b) {
            if (+new Date(a.date) > +new Date(b.date)) {
                return -1
            }
            if (+new Date(a.date) < +new Date(b.date)) {
                return 1;
            }
            return (a.name < b.name) ? -1 : 1;
        });
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(fileSet));
        res.end();
    });
}

exports.upload = function (res, req) {
    if (req.method !== 'POST') {
        startHome(res);
        return;
    }

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (!certificate(fields.pass)) {
            errorEnd(res, 'certification error!!!');
            return;
        }
        if (!files.file) {
            errorEnd(res, 'no file!!!');
            return;
        }
        fs.rename(files.file.path, files.file.name, function (err) {
            if (err) {
                console.log(err);
                errorEnd(res, 'rename error!!!!!');
                return;
            }
            ftp.upload(files.file.name, function () {
                deleteFile(files.file.name);
                res.writeHeader(200, { 'Content-Type': 'text/plain' });
                res.end();
            });
        });
    });
};

function errorEnd(res, message) {
    console.log(message + ' ' + new Date().toLocaleString());
    res.writeHeader(400, { 'Content-Type': 'text/plain' });
    res.end();
}

exports.readFile = function (res, req) {
    readFile(res, req.url);
};

function startHome(res) {
    readFile(res, '/index.html');
}

function readFile(res, fileName) {
    fs.readFile(__dirname + (fileName || '/index.html'), 'utf-8', function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.write('404 Not Found');
            res.end();
        } else {
            res.writeHead(200, { 'Content-Type': getContentType(fileName) });
            res.write(data);
            res.end();
        }
    });
}

function getContentType(url) {
    var suffix = url.substr(url.lastIndexOf('.') + 1);
    return contentType[suffix] || 'text/plain';
}

function deleteFile(fileName) {
    fs.unlink(fileName, function (err) {
        if (err) throw err;
    });
}

function certificate(pass) {
    return pass === (process.env.UPLOAD_PASS || require('./settings').uploadPass);
}