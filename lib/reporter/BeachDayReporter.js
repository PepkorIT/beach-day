var fs = require("fs");
var path = require("path");
var BeachDayReporter = (function () {
    function BeachDayReporter() {
    }
    BeachDayReporter.prototype.jasmineStarted = function (suiteInfo) {
        this.dataStore = { suiteInfo: suiteInfo, suites: [] };
    };
    BeachDayReporter.prototype.suiteStarted = function (result) {
        result.startTime = new Date();
        // Build a tree
        result.childSuites = [];
        result.specList = [];
        result.parent = null;
        this.dataStore.suites.push(result);
        // Assign the parent and child
        if (this.currentSuite) {
            result.parent = this.currentSuite;
            this.currentSuite.childSuites.push(result);
        }
        // Set the current suite for the end or for the next suite
        this.currentSuite = result;
    };
    BeachDayReporter.prototype.suiteDone = function (result) {
        // Reassign back to the parent, may be null
        this.currentSuite = result.parent;
        result.endTime = new Date();
    };
    BeachDayReporter.prototype.specStarted = function (result) {
        result.startTime = new Date();
        this.currentSuite.specList.push(result);
    };
    BeachDayReporter.prototype.specDone = function (result) {
        result.endTime = new Date();
    };
    BeachDayReporter.prototype.jasmineDone = function (result) {
        try {
            this.buildReport(this.dataStore);
        }
        catch (e) {
            console.error(e.stack);
        }
    };
    BeachDayReporter.prototype.buildReport = function (data) {
        // Strip the parents in the specs
        BeachDayReporter.recurseSuitesSumUp(data.suites);
        var reportDir = path.join(process.cwd(), "reports");
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir);
        }
        fs.writeFileSync(reportDir + "/data.json", JSON.stringify(data, null, 4), { encoding: "utf8" });
    };
    /*
    UTIL FUNCTIONS
    --------------------------------------------
    */
    BeachDayReporter.recurseSuitesSumUp = function (data) {
        for (var i = 0; i < data.length; i++) {
            var suite = data[i];
            if (suite.childSuites)
                this.recurseSuitesSumUp(suite.childSuites);
            // Populate data based on children
            // Delete circular reference before we finish
            delete suite.parent;
        }
    };
    return BeachDayReporter;
})();
exports.BeachDayReporter = BeachDayReporter;
