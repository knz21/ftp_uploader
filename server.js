var http = require('http');
var url = require('url');

exports.start = function (handle) {
    process.on('uncaughtException', function (err) {
        console.log('error!!!!!' + ' ' + new Date().toLocaleString());
        console.log(err);
    });

    function onRequest(req, res) {
        (handle[url.parse(req.url).pathname] || handle['readFile'])(res, req);
    }

    var port = process.env.PORT || require('./settings').port;
    http.createServer(onRequest).listen(port);
    console.log('Upload server. port:' + port + ' ' + new Date().toLocaleString());
};