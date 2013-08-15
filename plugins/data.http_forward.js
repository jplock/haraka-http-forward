// data.http_forward
var redis = require('redis');
var request = require('request');
var async = require('async');
var util = require('util');
var client;

var REDIS_PREFIX = 'haraka';

exports.register = function () {
    var config = this.config.get('data.http_forward.ini');
    if (config.main.redis_server) {
        // No support for IPv6 in Redis yet...
        // TODO: make this regex support IPv6 when it does.
        var match = /^([^: ]+)(?::(\d+))?$/.exec(config.main.redis_server);
        if (match) {
            var host = match[1];
            var port = match[2] || '6379';
            this.logdebug('using redis on ' + host + ':' + port);
            client = redis.createClient(port, host);
        }
        else {
            // Syntax error
            throw new Error('syntax error');
        }
    }
    else {
        // Client default is 127.0.0.1:6379
        client = redis.createClient();
    }

    // select database
    if (config.main.redis_database) {
        client.select(config.main.redis_database);
    }

    // auth redis
    if (config.main.redis_password) {
        client.auth(config.main.redis_password);
    }

    client.on('error', function (err) {
        this.logerror('Redis Error: ' + err);
    });
};

exports.hook_data = function (next, connection) {
    // enable mail body parsing
    connection.transaction.parse_body = 1;
    return next();
};

exports.hook_data_post = function (next, connection) {
    var transaction = connection.transaction;

    async.forEach(
        transaction.rcpt_to,
        function (rcpt_to, callback) {
            var key = REDIS_PREFIX + ':' + rcpt_to.user;

            connection.logdebug('Checking for ' + key + ' in redis');
            client.get(key, function (err, reply) {
                if (err) {
                    return callback(err);
                }
                if (!reply) {
                    connection.logerror('Key ' + key + ' not found in redis');
                    return callback();
                }
                else {
                    connection.logdebug('Found key ' + key + ' -> ' + reply);
                }

                var options = {
                    'uri': reply,
                    'headers': {
                        'Content-Type': 'text/plain; charset=utf-8'
                    },
                    'method': 'post',
                    'timeout': 1000,
                    'pool': false,
                    'jar': false
                };
                connection.logdebug('request options: ' + util.format(options));

                var forward = request.post(options);

                forward.on('error', function (err) {
                    connection.logerror('Unable to connect to remote host: ' +
                        reply);
                    return callback(err);
                });

                forward.on('end', function () {
                    connection.logdebug('end event');
                    return callback();
                });

                transaction.message_stream.pipe(forward, {'dot_stuffing': true,
                                                          'ending_dot': true});
            });
        },
        function (err) {
            connection.logdebug('reached callback');
            if (err) {
                connection.logerror('Error occurred: ' + err);
            }
            return next();
        }
    );
};

