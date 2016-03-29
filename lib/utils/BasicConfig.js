module.exports = function(configFile) {
    var Jasmine             = require("jasmine");
    var SpecReporter        = require("jasmine-spec-reporter");
    var BeachDayReporter    = require("../reporter/BeachDayReporter").BeachDayReporter;

    var jasmine = new Jasmine();

    console.log("Settign up new default JASMINE Suite :)");
    console.log("----------------------------------------------------");

    // Disable default reporter
    jasmine.configureDefaultReporter({print: function(){}});

    // Add a basic reporter for the console :)
    jasmine.addReporter(new SpecReporter({
        displayStacktrace: "all"
    }));

    // Add our custom HTML reporter
    jasmine.addReporter(new BeachDayReporter());

    jasmine.loadConfigFile(configFile || "spec/jasmine.json");

    return jasmine;
};
