/**
 * Created by DEYI20160113 on 2016/10/25.
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

function send404(response) {
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('Error 404:resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {'Content-Type':mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

function serverStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exits) {
            if (exits) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                })
            } else {
                send404(response);
            }
        });
    }
}

var server = http.createServer(function(request, response) {
    var filePath = false;
    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serverStatic(response, cache, absPath);
});

server.listen(8080, function() {
    console.log('server listening on port 8080.');
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);
