module.exports = function(configFile, timeout, autoExecute) {
    var Jasmine             = require("jasmine");
    var SpecReporter        = require("jasmine-spec-reporter");
    var BeachDayReporter    = require("../reporter/BeachDayReporter").BeachDayReporter;

    var jasmineInst         = new Jasmine();

    console.log("Settign up new default JASMINE Suite :)");
    console.log("----------------------------------------------------");


    // Disable default reporter
    jasmineInst.configureDefaultReporter({print: function(){}});

    // Add a basic reporter for the console :)
    jasmineInst.addReporter(new SpecReporter({
        displayStacktrace: "all"
    }));

    // Add our custom HTML reporter
    jasmineInst.addReporter(new BeachDayReporter({
        includeAllConsoleLogs: false
    }));

    jasmineInst.loadConfigFile(configFile || "spec/jasmine.json");


    if (timeout == null) timeout = 10100;
    global.jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;
    //console.log("Set the timeout to: ", global.jasmine.DEFAULT_TIMEOUT_INTERVAL);

    // Run this config in a setTimeout so it happens after the implementer
    // has added any necessary changes
    if (autoExecute !== false){
        setTimeout(function(){
            jasmineInst.execute()
        }, 10);
    }

    return jasmineInst;
};
