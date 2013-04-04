var net = require('net');
var stream = require('stream');

var burro = require('burro');

function id() {
    return ( Math.random() * 1000000 ) | 0;
}

// and let's spit the objects coming back into process.stdout
var parser = new stream.Transform({objectMode: true});
parser._transform = function _transform (obj, encoding, done) {
    var self = this;
    self.push((new Date()).toISOString() + ' - (' + obj.id + ') ' + obj.msg + "\n");
    done();
};

// firstly, make a connection to the server
var client = net.createConnection(4096, function() {
    console.log('Client connected ...');

    // we're connected, so turn this client into a burro
    client = burro.wrap(client);

    // ... and pipe the responses back somewhere
    client.pipe(parser).pipe(process.stdout);

    // and send it some messages
    var msg = 'Hello, World!';
    for ( var i = 0; i < 10; i++ ) {
        var myId = id();
        console.log('' + i + ') Sending message ' + myId + ') ' + msg + '...');
        client.write({
            id  : myId,
            msg : '(' + i + ') ' + msg,
        });
    }
});

client.on('end', function() {
    console.log('Client disconnected');
});

client.on('error', function(err) {
    console.log('Error: ', err);
});
