var net = require('net');
var burro = require('burro');
var stream = require('stream');

var server = net.createServer(function(conn) {
    console.log('Client connected ...');
    // Note: conn is a stream!

    // wrap the connection in burro
    conn = burro.wrap(conn);

    // create a new receiver to get all the messages
    var receiver = new stream.Transform({objectMode: true});
    receiver._transform = function _transform (obj, encoding, done) {
        var self = this;

        console.log('Got an object ...');
        // delay this response for up to 5 seconds
        var delay = ( Math.random() * 5 ) | 0;
        console.log('* delaying for ' + delay + 's, id=' + obj.id);

        // ok, send this message back with the message uppercased (SIMULATE some ASYNC work)
        setTimeout(function() {
            console.log('* delayed: id=' + obj.id);

            // uppercase the msg
            obj.msg = obj.msg.toUpperCase();

            // the message has been transformed
            self.push(obj);
        }, delay * 1000);

        // instead of waiting, we have 'queued' the message, so just call done
        // and we'll send the message on once we are done with it
        done();
    };

    // finally, pipe the connection into our receiver and pipe it back into the connection
    conn.pipe(receiver).pipe(conn);
});

var port = 4096;
server.listen(port, function() {
    console.log(process.title + ' is listening on port ' + port);
});
