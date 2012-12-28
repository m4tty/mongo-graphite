

var SimpleSocket = require('./SimpleSocket');
var url = require('url');

module.exports = GraphiteClient;


function GraphiteClient(properties) {
  properties = properties || {};
  this.debugMode = properties.debugMode || false;

  this.host = (url.parse(properties.host)).hostname || properties.host;

  this.port = properties.port || 2003;

}

GraphiteClient.prototype.write = function(metrics, timestamp, cb) {

  if (typeof timestamp === 'function') {
    cb = timestamp;
    timestamp = null;
  }

  timestamp = timestamp || Date.now();
  timestamp = Math.floor(timestamp / 1000);

  this._connect();

  var lines = '';
  for (var path in metrics) {
    var value = metrics[path];
    lines += [path, value, timestamp].join(' ') + '\n';
  }
  if (this.debugMode) {
  	console.log('writing to graphite... ', lines);
  }

  //console.log('metrics', metrics);
  this._socket.write(lines, 'utf-8', cb);
};

GraphiteClient.prototype._connect = function() {
  if (this._socket) return;
  if (this.debugMode) {
  	console.log('creating socket connection', this.host, this.port);
  }
  
  this._socket = SimpleSocket.createConnection(this.port, this.host);
};

GraphiteClient.prototype.end = function() {
	if (this.debugMode) {
  		console.log('GraphiteClient socket end.  _socket: ', this._socket);
	}
  if (this._socket) this._socket.end();
};


