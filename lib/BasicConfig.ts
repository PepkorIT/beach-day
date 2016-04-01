import {BeachDayReporter} from "./reporter/BeachDayReporter";
var Jasmine             = require("jasmine");
var SpecReporter        = require("jasmine-spec-reporter");

export function getBasicConfig(reportName:string, configFile:string = "jasmine_config.json", timeout:number = 10100, autoExecute:boolean = true){

    var jasmineInst = new Jasmine();
    global["jasmine"].DEFAULT_TIMEOUT_INTERVAL = timeout;

    console.log("Setting up new default JASMINE Suite :)");
    console.log("----------------------------------------------------");


    // Disable default reporter
    jasmineInst.configureDefaultReporter({print: function(){}});

    // Add a basic reporter for the console :)
    jasmineInst.addReporter(new SpecReporter({
        displayStacktrace: "all"
    }));

    // Add our custom HTML reporter
    jasmineInst.addReporter(new BeachDayReporter({
        reportName              : reportName,
        logToConsole            : true,
        includeAllConsoleLogs   : false,
        //maxTestTime             : 800
    }));

    jasmineInst.loadConfigFile(configFile);

    // Run this config in a setTimeout so it happens after the implementer
    // has added any necessary changes
    if (autoExecute !== false){
        setTimeout(function(){
            jasmineInst.execute()
        }, 10);
    }

    return jasmineInst;
};