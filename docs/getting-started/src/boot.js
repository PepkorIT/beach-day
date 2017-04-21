// Import the required dependencies for the booting of jasmine
var BeachDayReporter    = require("beach-day").BeachDayReporter;
var Jasmine             = require("jasmine");
var SpecReporter        = require("jasmine-spec-reporter").SpecReporter;

// Create a new instance of the jasmine framework
var jasmineInst         = new Jasmine();

// Setup sensible timeout amount for the jasmine tests
// We don't want our jasmine tests to timeout before an http call has been completed
global["jasmine"].DEFAULT_TIMEOUT_INTERVAL = 10000; // milliseconds

// Disable default jasmine reporter
jasmineInst.configureDefaultReporter({ print: function () { } });

// Add the spec reporter for console reporting
// https://github.com/bcaudan/jasmine-spec-reporter
jasmineInst.addReporter(new SpecReporter({
    displayStacktrace: "all"
}));

// Add an instance of the beach-day custom HTML reporter
// All the default config is used
jasmineInst.addReporter(new BeachDayReporter());

// Load up a jasmine config for the test environment
jasmineInst.loadConfigFile("jasmine_config.json");

// Run the jasmine instance to start all tests
jasmineInst.execute();