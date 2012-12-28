# mongodb-graphite

A node script that calls mongodb and runs relevant monitoring and instrumentation commands, then parses the return data and sends to graphite.

# Ways to use it

The mongodb-graphite script can be used in two ways.  First, is to allow mongodb-graphite to manage the continous check interval (the cron job).  Second, is to configure mongodb-graphite as a single run (an interval of -1) and then to configure a cron to run it at an interval (E.g. crontab -e * * * * * node etc).

To setup/configure:

```
git clone git@github.com:m4tty/mongo-graphite.git
cd mongo-graphite
npm install
```

Then be sure to modify the config.json to meet your needs.  

* You'll need to set up the proper db servers configuration so that it can connect to your mongos.  
* You'll need to point at your graphite server (the carbon endpoint).
* You'll need to specify the commands and values you are interested in.

To run:

```
	node mongo-graphite.js 1> debug.log 2> errors.log

```
### Configuration

The mongodb-graphite can be configured using the commandObject in config to run the following commands (e.g db.dbStats, coll.collStats, admin.replSetGetStatus, admin.serverStatus).  The most interesting of which is serverStatus.  The default configuration (in config.json) will only run serverStatus.

For example:
```javascript
    "commands": [
        {
            "targetDb": "test",
            "commandObject": {
                "dbStats": 1,
                "scale": 1024
            },
            ...
```

The json returned from the commands are parsed and any return value (that is a number) can be forwarded to graphite by specifying it in the config.json using a dotNotation syntax.
For example.

```javascript
    "commands": [
        {
           ...
           ,
            "valueToGraphite": [
                {
                    "location": "globalLock.ratio"
                },
                {
                    "location": "mem.resident"
                },
                {
                    "location": "mem.virtual"
                },
                {
                    "location": "mem.mapped"
                },
                {
                    "location": "indexCounters.btree.accesses"
                },
                {
                    "location": "indexCounters.btree.hits"
                },
                {
                    "location": "indexCounters.btree.misses"
                }
            ]
        }

```


### Notes
If you have issues running mongodb-graphite, please turn on debugMode and give it another go.  Hopefully, this will highlight the issue:
```javascript
{
	"debugMode" : false,
	...
```	


### A full "commands" config example using all metrics from dbStats and serverStatus
```javascript
    "commands": [
        {
            "targetDb": "test",
            "commandObject": {
                "dbStats": 1,
                "scale": 1024
            },
            "valueToGraphite": [
                {
                    "location": "objects"
                },
                {
                    "location": "avgObjSize"
                },
                {
                    "location": "dataSize"
                },
                {
                    "location": "storageSize"
                },
                {
                    "location": "indexSize"
                }
            ]
        },
        {
            "targetDb": "admin",
            "commandObject": {
                "serverStatus": 1
            },
            "valueToGraphite": [
                {
                    "location": "globalLock.totalTime"
                },
                {
                    "location": "globalLock.lockTime"
                },
                {
                    "location": "globalLock.ratio"
                },
                {
                    "location": "globalLock.currentQueue.total"
                },
                {
                    "location": "globalLock.currentQueue.readers"
                },
                {
                    "location": "globalLock.currentQueue.writers"
                },
                {
                    "location": "globalLock.activeClients.total"
                },
                {
                    "location": "globalLock.activeClients.readers"
                },
                {
                    "location": "globalLock.activeClients.writers"
                },
                {
                    "location": "mem.resident"
                },
                {
                    "location": "mem.virtual"
                },
                {
                    "location": "mem.mapped"
                },
                {
                    "location": "extra_info.heap_usage_bytes"
                },
                {
                    "location": "extra_info.page_faults"
                },
                {
                    "location": "indexCounters.btree.accesses"
                },
                {
                    "location": "indexCounters.btree.hits"
                },
                {
                    "location": "indexCounters.btree.misses"
                },
                {
                    "location": "indexCounters.btree.resets"
                },
                {
                    "location": "indexCounters.btree.missRatio"
                },
                {
                    "location": "backGroundFlushing.flushes"
                },
                {
                    "location": "backGroundFlushing.total_ms"
                },
                {
                    "location": "backGroundFlushing.average_ms"
                },
                {
                    "location": "cursors.timedOut"
                },
                {
                    "location": "network.bytesIn"
                },
                {
                    "location": "network.bytesOut"
                },
                {
                    "location": "network.numRequests"
                },
                {
                    "location": "connections.current"
                },
                {
                    "location": "connections.available"
                },
                {
                    "location": "opcounters.insert"
                },
                {
                    "location": "opcounters.update"
                },
                {
                    "location": "opcounters.delete"
                },
                {
                    "location": "opcounters.query"
                },
                {
                    "location": "asserts.regular"
                },
                {
                    "location": "asserts.warning"
                },
                {
                    "location": "asserts.msg"
                },
                {
                    "location": "asserts.user"
                },
                {
                    "location": "asserts.rollovers"
                },
                {
                    "location": "dur.commits"
                },
                {
                    "location": "dur.journaledMB"
                },
                {
                    "location": "dur.writeToDataFilesMB"
                },
                {
                    "location": "dur.compression"
                },
                {
                    "location": "dur.commitsInWriteLock"
                },
                {
                    "location": "dur.earlyCommits"
                },
                {
                    "location": "dur.timeMs.dt"
                },
                {
                    "location": "dur.timeMs.prepLogBuffer"
                },
                {
                    "location": "dur.timeMs.writeToJournal"
                },
                {
                    "location": "dur.timeMs.writeToDataFiles"
                },
                {
                    "location": "dur.timeMs.remapPrivateView"
                }
            ]
        }
    ]

```


License
===
The MIT License (MIT) Copyright (c) 2012 Matt Self

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
