
//var http = require('http');
//var request = require('request');

module.exports = function NullDecryptor(settings) {

	settings = settings || {};

	this.decrypt = function(algorithm, moniker, cipherText, callback) {
		return callback(null, cipherText);
	}
}