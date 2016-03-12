var _       = require("lodash");
var fs      = require("fs");
var path    = require("path");

function BeachDayReporter(){}

_.extend(BeachDayReporter.prototype, {
    _dataStore      : null,
    _level          : 0,
    _currentSuite   : null,


    jasmineStarted: function(suiteInfo) {
        this._dataStore     = {suiteInfo:suiteInfo, suites:[]};
    },
    suiteStarted: function(result) {
        result.startTime    = new Date();
        // Build a tree
        result.childSuites  = [];
        result.specs        = [];
        result.parent       = null;
        this._dataStore.suites.push(result);

        // Assign the parent and child
        if (this._currentSuite){
            result.parent   = this._currentSuite;
            this._currentSuite.childSuites.push(result);
        }
        // Set the current suite for the end or for the next suite
        this._currentSuite  = result;
    },
    suiteDone: function(result) {
        // Reassign back to the parent, may be null
        this._currentSuite  = result.parent;
        result.endTime      = new Date();
    },
    specStarted: function(result) {
        result.startTime = new Date();
        this._currentSuite.specs.push(result);
    },
    specDone: function(result) {
        result.endTime = new Date();
    },
    jasmineDone: function(result) {
        try{
            this.buildReport(this._dataStore);
        }
        catch (e){
            console.error(e.stack);
        }
    },

    buildReport: function(data){

        // Strip the parents in the specs
        recurse(data.suites, function(source, property){
            delete source.parent;
        });

        var reportDir = path.join(process.cwd(), "reports");
        if (!fs.existsSync(reportDir)){
            fs.mkdirSync(reportDir);
        }
        fs.writeFileSync(reportDir +  "/data.json", JSON.stringify(data, null, 4), {encoding:"utf8"});



        /*
        UTIL FUNCTIONS
        --------------------------------------------
        */
        function recurse(data, cb){
            if (data instanceof Array){
                for (var i = 0; i < data.length; i++) {
                    if (typeof data[i] == "object") recurse(data[i], cb);
                }
            }
            else {
                for (var propName in data){
                    cb(data, propName);
                    if (typeof data[propName] == "object") recurse(data[propName], cb);
                }
            }
        }
    }
});

module.exports = BeachDayReporter;