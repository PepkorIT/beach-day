import {BeachDayReporter} from "./lib/reporter/BeachDayReporter";
var Jasmine             = require("jasmine");
var SpecReporter        = require("jasmine-spec-reporter");

var jasmineInst = new Jasmine();
global["jasmine"].DEFAULT_TIMEOUT_INTERVAL = 5000;

console.log("Setting up new default JASMINE Suite :)");
console.log("----------------------------------------------------");


// Disable default reporter
jasmineInst.configureDefaultReporter({print: function(){}});

// Add a basic reporter for the console :)
jasmineInst.addReporter(new SpecReporter({
    displayStacktrace       : "all",
    displayPendingSummary   : false,
    displayPendingSpec      : false
}));

// Add our custom HTML reporter
jasmineInst.addReporter(new BeachDayReporter({
    logToConsole            : true,
    includeAllConsoleLogs   : false,
    maxTestTime             : 2000
}));

jasmineInst.loadConfigFile("jasmine_config.json");
jasmineInst.execute();