import {BeachDayReporter} from './src';

var Jasmine      = require('jasmine');
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

var jasmineInst                            = new Jasmine();
global['jasmine'].DEFAULT_TIMEOUT_INTERVAL = 5000;

console.log('Setting up new default JASMINE Suite :)');
console.log('----------------------------------------------------');


// Disable default reporter
jasmineInst.configureDefaultReporter({
    print: function () {
    }
});

// Add a basic reporter for the console :)
jasmineInst.addReporter(new SpecReporter({
    displayStacktrace    : 'all',
    displayPendingSummary: false,
    displayPendingSpec   : false
}));

// Add our custom HTML reporter
jasmineInst.addReporter(new BeachDayReporter({
    logToConsole         : true,
    includeAllConsoleLogs: false,
    maxTestTime          : 2000
}));

const config = {
    spec_dir                    : '',
    spec_files                  : [
        'dist/src/**/*.spec.js'
    ],
    helpers                     : [],
    stopSpecOnExpectationFailure: false,
    random                      : false
};

jasmineInst.loadConfig(config);
jasmineInst.execute();
