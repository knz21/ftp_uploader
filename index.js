var server = require('./server');
var handlers = require('./handlers');

var handle = {};
handle['/'] = handlers.start;
handle['/submit'] = handlers.submit;
handle['/load'] = handlers.load;
handle['/upload'] = handlers.upload;
handle['readFile'] = handlers.readFile;

server.start(handle);