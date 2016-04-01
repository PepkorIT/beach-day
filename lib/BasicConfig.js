"use strict";
var BeachDayReporter_1 = require("./reporter/BeachDayReporter");
var Jasmine = require("jasmine");
var SpecReporter = require("jasmine-spec-reporter");
function getBasicConfig(reportName, configFile, timeout, autoExecute) {
    if (configFile === void 0) { configFile = "jasmine_config.json"; }
    if (timeout === void 0) { timeout = 10100; }
    if (autoExecute === void 0) { autoExecute = true; }
    var jasmineInst = new Jasmine();
    global["jasmine"].DEFAULT_TIMEOUT_INTERVAL = timeout;
    console.log("Setting up new default JASMINE Suite :)");
    console.log("----------------------------------------------------");
    // Disable default reporter
    jasmineInst.configureDefaultReporter({ print: function () { } });
    // Add a basic reporter for the console :)
    jasmineInst.addReporter(new SpecReporter({
        displayStacktrace: "all"
    }));
    // Add our custom HTML reporter
    jasmineInst.addReporter(new BeachDayReporter_1.BeachDayReporter({
        reportName: reportName,
        includeAllConsoleLogs: false,
    }));
    jasmineInst.loadConfigFile(configFile);
    // Run this config in a setTimeout so it happens after the implementer
    // has added any necessary changes
    if (autoExecute !== false) {
        setTimeout(function () {
            jasmineInst.execute();
        }, 10);
    }
    return jasmineInst;
}
exports.getBasicConfig = getBasicConfig;
;
