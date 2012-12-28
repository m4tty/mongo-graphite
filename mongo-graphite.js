var Db = require('mongodb').Db,
	Server = require('mongodb').Server,
	Admin = require('mongodb').Admin,
	ReadPreference = require('mongodb').ReadPreference,
	_ = require('underscore'),
	ReplSetServers = require('mongodb').ReplSetServers,
	GraphiteClient = require('./lib/GraphiteClient'),
	config = require('./config.json');

var Decryptor = null;

var args = process.argv.slice(2);
if (args) {
	Decryptor = args[0];	
}
if (!Decryptor) {
	Decryptor = require('./lib/nullDecryptor');
}
var decryptor = new Decryptor();

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
var gather_interval = 60;
if (config.runIntervalSeconds)
{
	if (gather_interval > 0) {
		gather_interval = config.runIntervalSeconds * 1000;
	}
} 

var debugMode = config.debugMode || false;

var gc = new GraphiteClient({'port':config.graphite.port, 'host':config.graphite.host, 'debugMode': debugMode});


setInterval(function() {

	//loop through the "commands" we plan to run
  for (var i = config.commands.length - 1; i >= 0; i--) {

  	var command = config.commands[i];
	
  	if (debugMode) {
  		console.log('command:', command);
  	}
	var target = command.targetDb;


	(function (currentCommand, targetDb) {

	//now loop through the dbs, and match them with the command. TODO: 
  	for (var z = config.dbs.length - 1; z >= 0; z--) {
 		if (config.dbs[z].name.toLowerCase() === targetDb.toLowerCase())
  		{
  			var currentDb = config.dbs[z];
			if (_.isArray(currentDb.servers)){
				var servers = currentDb.servers;
				var dbName = currentDb.name;
				var user = currentDb.user;
				var password = currentDb.pass._value;

				if (currentDb.pass._isCipherText == true) {
					decryptor.decrypt(config.decrypt.algorithm, config.decrypt.moniker, password, function(err, result) {
						if (err) {
							console.log('A problem occurred while attempting to decrypt the password.  We will be unable to call mongo. ', err)
						} else {
							password = result;
							pullAndSend(servers, dbName, user, password, currentCommand);	
						}
					});

				}
				else {
					pullAndSend(servers, dbName, user, password, currentCommand);
				}

			}

  		} else {
  			//console.log('No matching database defined for command target db:', targetDb);
  		}
  	};
  })(command, target);
  };

}, gather_interval);


var pullAndSend = function (servers, dbName, user, password, currentCommand) {
			var serverArray = [];

					for( var y =0;y< servers.length;y++ ) {

						var serverHost = servers[y].host;
						var serverPort = servers[y].port;

						db = new Db(dbName, new Server(serverHost, serverPort, {}, {}),{ auto_reconnect: true, safe: true, strict: true });
						
						(function (database, host, user, password, currentCommand) {
						database.open(function(err, database) {
							
							if(!err) {
									database.authenticate(user, password, function(err) {

										if (err) {
											console.error('unable to login', err);
											database.close();
										} else {
												database.command(currentCommand.commandObject, function(err, result) {
													//console.log('command callback', err, result);

													var parser = new JsonParser();
													var metricsToCapture = currentCommand.valueToGraphite;
													for (var a = metricsToCapture.length - 1; a >= 0; a--) {
														
														var value = parser.parse(metricsToCapture[a].location,result);
														
														host = host.replace(/\./g,'_');

														var metricName = 'mongodb.' + host + '.' + database.databaseName + '.' + metricsToCapture[a].location;
														if (value || value === 0) {
															var tempObj = {};
															tempObj[metricName] = value;
															if (debugMode) {
																console.log('sending metric:', tempObj);
															}
															gc.write(tempObj);							
														} else {
															if (debugMode) {
																console.log('no value for metric:', metricName, value);
															}
														}
			
													};
													database.close();
												})

										}
									});
							}
						});
						})(db, serverHost, user, password, currentCommand);
					}			
};


//serverStatus
//stats
//replSetGetStatus
//serverInfo

var JsonParser = function(dotNotation) {
    //this.billSize = billSize;
    this.selectorFormat = dotNotation;
    this.next = null;
}
JsonParser.prototype = {
    parse: function(dotNotation, serverStatus) {
    	var value = this._getValueByDotNotation(dotNotation, serverStatus);
        serverStatus && this.next && this.next.parse(serverStatus);
        return value;
    },
    // set the stack that comes next in the chain
    setNextParser: function(stack) {
        this.next = stack;
    },
	_index: function(obj,i) {
		if (obj) {
			return obj[i]
		} else {
			return null;
		}
	},
	_getValueByDotNotation: function(location, obj) {
		return location.split('.').reduce(this._index, obj);
	}

}






