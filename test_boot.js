var Jasmine         = require("jasmine");
var SpecReporter    = require("jasmine-spec-reporter");

// This will be replaced beach-day in an implementation of this framework
var BeachDay        = require("./index.js");


// Load the config file
var jasmine = new Jasmine();

console.log("Settign up new JASMINE Suite :)");
console.log("----------------------------------------------------");

// Disable default reporter
jasmine.configureDefaultReporter({print: function(){}});

// Add a basic reporter for the console :)
jasmine.addReporter(new SpecReporter());

// Add our custom HTML reporter
jasmine.addReporter(new BeachDay.BeachDayReporter());

jasmine.loadConfigFile("spec/jasmine.json");

jasmine.execute();