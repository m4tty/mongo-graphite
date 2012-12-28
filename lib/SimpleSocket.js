var net = require('net');

module.exports = SimpleSocket;
function SimpleSocket(properties) {
  properties = properties || {};

  this.port = properties.port;
  this.host = properties.host;
  this.debugMode = properties.debugMode || false;
  this._socket = null;

}

SimpleSocket.createConnection = function(port, host) {
  var socket = new this({port: port, host: host});
  return socket;
};

SimpleSocket.prototype.write = function() {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args[args.length - 1];

  if (typeof cb === 'function') {
  	//do something with the callback?
  }

  this._connect();

  try {
  	//console.log('socket', this._socket);
    this._socket.write.apply(this._socket, args);
  } catch (err) {
  	console.error('socket write err', err);
    this._socket.destroy();
    this._socket = null;
  }
};

SimpleSocket.prototype._connect = function() {
  if (this._socket) return;

  var self = this;

  console.log(this.host, this.port);
  this._socket = net
    .createConnection(this.port, this.host)
    .once('error', function(err) {
      self._socket = null;
      console.error('socket error event', err);
    });
};

SimpleSocket.prototype.end = function() {
  if (this._socket) this._socket.end();
};

SimpleSocket.prototype.destroy = function() {
  if (this._socket) this._socket.destroy();
};