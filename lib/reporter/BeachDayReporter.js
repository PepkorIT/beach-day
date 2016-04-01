"use strict";
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var ReportGenerator_1 = require("./ReportGenerator");
// Non typescript dependencies
var moment = require("moment");
var stringifyObject = require("stringify-object");
var ReporterConfig = (function () {
    function ReporterConfig(config) {
        if (config === void 0) { config = {}; }
        // Default to sensible locations and templates
        this.reportName = config.reportName ? config.reportName : "Report: " + (new Date()).toString();
        this.reportDir = config.reportDir ? config.reportDir : path.join(process.cwd(), "reports");
        this.viewDataPath = config.viewDataPath ? config.viewDataPath : path.join(process.cwd(), "reports", "data.json");
        this.headerTemplatePath = config.headerTemplatePath ? config.headerTemplatePath : path.resolve(__dirname, "../templates/header.mustache");
        this.indexTemplatePath = config.indexTemplatePath ? config.indexTemplatePath : path.resolve(__dirname, "../templates/index.mustache");
        this.suiteTemplatePath = config.suiteTemplatePath ? config.suiteTemplatePath : path.resolve(__dirname, "../templates/suite.mustache");
        this.stylesPath = config.stylesPath ? config.stylesPath : path.resolve(__dirname, "../templates/styles.scss");
        this.titleTemplatePath = config.titleTemplatePath ? config.titleTemplatePath : path.resolve(__dirname, "../templates/title.mustache");
        this.summaryTemplatePath = config.summaryTemplatePath ? config.summaryTemplatePath : path.resolve(__dirname, "../templates/summary.mustache");
        this.latestTemplatePath = config.latestTemplatePath ? config.latestTemplatePath : path.resolve(__dirname, "../templates/latest.mustache");
        this.logToConsole = config.hasOwnProperty("logToConsole") ? config.logToConsole : true;
        this.includeAllConsoleLogs = config.hasOwnProperty("includeAllConsoleLogs") ? config.includeAllConsoleLogs : false;
        this.maxTestTime = config.maxTestTime; // Default is not set
    }
    Object.defineProperty(ReporterConfig.prototype, "viewDataDir", {
        get: function () {
            return path.dirname(this.viewDataPath);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReporterConfig.prototype, "reportDynamicName", {
        get: function () {
            if (process.env.BEACH_DAY_REPORT_NAME) {
                return process.env.BEACH_DAY_REPORT_NAME + ".html";
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReporterConfig.prototype, "reportDynamicPath", {
        get: function () {
            if (this.reportDynamicName) {
                return path.join(this.reportDir, this.reportDynamicName);
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReporterConfig.prototype, "latestReportName", {
        get: function () {
            if (this.reportDynamicName) {
                return this.reportDynamicName;
            }
            else {
                return "beach-day-report.html";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReporterConfig.prototype, "reportStaticPath", {
        get: function () {
            return path.join(this.reportDir, "beach-day-report.html");
        },
        enumerable: true,
        configurable: true
    });
    return ReporterConfig;
}());
exports.ReporterConfig = ReporterConfig;
/*
API
--------------------------------------------
*/
// Hook to allow the env to register itself with the reporter
var lastCreatedInstance;
function setCurrentEnvironment(env) {
    lastCreatedInstance.currentEnvironment = env;
}
exports.setCurrentEnvironment = setCurrentEnvironment;
function clearCurrentEnvironment() {
    lastCreatedInstance.currentEnvironment = null;
}
exports.clearCurrentEnvironment = clearCurrentEnvironment;
// Store refs before they are overridden
var consoleOrig = global.console;
var logOrig = global.console.log;
var infoOrig = global.console.info;
var debugOrig = global.console.debug;
var warnOrig = global.console.warn;
var errorOrig = global.console.error;
var ReporterConsole = (function () {
    function ReporterConsole() {
        var _this = this;
        this.logToConsole = true;
        this.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _this.store(args, logOrig);
        };
        this.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _this.store(args, infoOrig);
        };
        this.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _this.store(args, debugOrig);
        };
        this.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _this.store(args, warnOrig);
        };
        this.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _this.store(args, errorOrig);
        };
    }
    Object.defineProperty(ReporterConsole.prototype, "currentSpec", {
        set: function (value) {
            this._currentSpec = value;
            // Append the cached log lines
            if (this.cache) {
                this._currentSpec.debugData = this._currentSpec.debugData.concat(this.cache);
                this.cache = null;
            }
        },
        enumerable: true,
        configurable: true
    });
    ReporterConsole.prototype.store = function (args, logger) {
        if (this._currentSpec) {
            this._currentSpec.debugData.push(args);
        }
        else {
            if (this.cache == null)
                this.cache = [];
            this.cache.push(args);
        }
        if (this.logToConsole) {
            logger.apply(consoleOrig, args);
        }
    };
    return ReporterConsole;
}());
exports.ReporterConsole = ReporterConsole;
var reporterConsole = new ReporterConsole();
reporterConsole.logToConsole = false;
exports.console = reporterConsole;
var BeachDayReporter = (function () {
    function BeachDayReporter(config) {
        if (config && !(config instanceof ReporterConfig)) {
            config = new ReporterConfig(config);
        }
        this.config = config == null ? new ReporterConfig() : config;
        lastCreatedInstance = this;
        reporterConsole.logToConsole = config.logToConsole;
        // Override with our local proxy
        if (config.includeAllConsoleLogs) {
            global.console.log = reporterConsole.log;
            global.console.info = reporterConsole.info;
            global.console.debug = reporterConsole.debug;
            global.console.warn = reporterConsole.warn;
            global.console.error = reporterConsole.error;
        }
    }
    Object.defineProperty(BeachDayReporter.prototype, "currentEnvironment", {
        set: function (env) {
            this._currentEnvironment = env;
            //consoleOrig.log("----------> Setting current environment: ", env);
        },
        enumerable: true,
        configurable: true
    });
    BeachDayReporter.prototype.wrap = function (cb) {
        try {
            cb();
        }
        catch (e) {
            consoleOrig.log(e.stack);
        }
    };
    /*
    Jasmine methods
    --------------------------------------------
    */
    BeachDayReporter.prototype.jasmineStarted = function (suiteInfo) {
        var _this = this;
        this.wrap(function () {
            _this.dataStore = { suiteInfo: suiteInfo, isSpec: false, id: (new Date()).getTime() + "", level: 0 };
            _this.initIViewData(_this.dataStore);
        });
    };
    BeachDayReporter.prototype.suiteStarted = function (result) {
        var _this = this;
        this.wrap(function () {
            result.startTime = new Date();
            // Assign the parent and child
            if (_this.currentSuite) {
                result.parent = _this.currentSuite;
                _this.currentSuite.viewChildren.push(result);
            }
            else {
                result.parent = null;
                _this.dataStore.viewChildren.push(result);
            }
            // Set the current suite for the end or for the next suite
            _this.currentSuite = result;
            _this.initIViewData(_this.currentSuite);
        });
    };
    BeachDayReporter.prototype.suiteDone = function (result) {
        var _this = this;
        this.wrap(function () {
            // Reassign back to the parent, may be null
            _this.currentSuite = result.parent;
            result.endTime = new Date();
        });
    };
    BeachDayReporter.prototype.specStarted = function (result) {
        var _this = this;
        this.wrap(function () {
            result.startTime = new Date();
            result.isSpec = true;
            _this.currentSpec = result;
            _this.initIViewData(_this.currentSpec);
            _this.currentSuite.viewChildren.push(result);
            reporterConsole.currentSpec = _this.currentSpec;
        });
    };
    BeachDayReporter.prototype.specDone = function (result) {
        var _this = this;
        this.wrap(function () {
            result.endTime = new Date();
            _this.currentSpec = null;
            // Clear out the current environment
            // as this should be set by every env.wrap execution
            _this.currentEnvironment = null;
            // Clone the status so we can edit it without interfering with other reporters
            result.beachStatus = result["status"];
            if (_this._currentEnvironment) {
                // If the environment is already failed, then set the status to not run
                if (_this._currentEnvironment.failed === true) {
                    if (result.beachStatus != BeachDayReporter.STATUS_SKIPPED) {
                        result.beachStatus = BeachDayReporter.STATUS_NOT_RUN;
                    }
                }
                else {
                    // If the test failed, fail the entire environment
                    if (result.beachStatus == BeachDayReporter.STATUS_FAILED) {
                        _this._currentEnvironment.failed = true;
                    }
                }
            }
        });
    };
    BeachDayReporter.prototype.jasmineDone = function (result) {
        var _this = this;
        this.wrap(function () {
            // Strip the parents in the specs
            _this.recurseSuitesPopulateViewData(_this.dataStore);
            if (_this.config.maxTestTime) {
                _this.dataStore.maxTestTime = _this.formatDuration(_this.config.maxTestTime);
            }
            // Generate HTML report
            ReportGenerator_1.generate(_this.dataStore, _this.config);
            // Generate JSON from view data
            if (!fs.existsSync(_this.config.viewDataDir)) {
                fs.mkdirSync(_this.config.viewDataDir);
            }
            fs.writeFileSync(_this.config.viewDataPath, JSON.stringify(_this.dataStore, null, 4), { encoding: "utf8" });
        });
    };
    /*
    UTIL FUNCTIONS
    --------------------------------------------
    */
    BeachDayReporter.prototype.recurseSuitesPopulateViewData = function (data, level) {
        var _this = this;
        if (level === void 0) { level = 1; }
        data.viewChildren.forEach(function (specOrSuite) {
            specOrSuite.level = level;
            if (!specOrSuite.isSpec) {
                delete specOrSuite.parent;
                _this.recurseSuitesPopulateViewData(specOrSuite, level + 1);
                _this.prettyProps(specOrSuite);
            }
            else {
                // Build up data
                var spec = specOrSuite;
                spec.durationMilli = spec.endTime.getTime() - spec.startTime.getTime();
                spec.skippedCount = spec.beachStatus == BeachDayReporter.STATUS_SKIPPED ? 1 : 0;
                spec.failedCount = spec.beachStatus == BeachDayReporter.STATUS_FAILED ? 1 : 0;
                spec.notRunCount = spec.beachStatus == BeachDayReporter.STATUS_NOT_RUN ? 1 : 0;
                spec.passedCount = spec.beachStatus == BeachDayReporter.STATUS_PASSED ? 1 : 0;
                spec.allPassed = spec.passedCount == 1;
                if (_this.config.maxTestTime != null && spec.durationMilli > _this.config.maxTestTime) {
                    spec.durationWarning = true;
                }
                _this.prettyProps(specOrSuite);
                // Add log debug data
                var topLogs = [];
                var addHeader = function (name) {
                    if (topLogs.length > 0)
                        topLogs.push("");
                    topLogs.push(name, "<hr />");
                };
                if (spec.beachStatus == BeachDayReporter.STATUS_PASSED || spec.beachStatus == BeachDayReporter.STATUS_FAILED) {
                    addHeader("Timing:");
                    topLogs.push(["Run Time:", specOrSuite.durationFormatted]);
                    topLogs.push(["Start Time:", moment(spec.startTime).format("HH:mm:ss.SSS")]);
                    topLogs.push(["End Time:", moment(spec.endTime).format("HH:mm:ss.SSS")]);
                }
                // Add implementation errors if there are any
                addHeader("Results:");
                if (spec.beachStatus == "failed") {
                    // Set the spec so the logs go to the right place
                    for (var i = 0; i < spec["failedExpectations"].length; i++) {
                        var expect = spec["failedExpectations"][i];
                        // If we find any failed expectations without a matcher name it means a runtime error
                        if (expect.matcherName == "" || expect.matcherName == null) {
                            spec.implementationErrorCount = 1;
                            topLogs.push("[TEST IMPLEMENTATION ERROR] - " + expect.stack);
                        }
                        else if (expect.matcherName == "throwImplementationError") {
                            spec.implementationErrorCount = 1;
                            topLogs.push("[TEST IMPLEMENTATION ERROR] - " + expect.message);
                        }
                        else {
                            topLogs.push("[ERROR] - " + expect.message);
                        }
                    }
                }
                else if (spec.beachStatus == "notRun") {
                    topLogs.push("Test was not run due to failing tests before it");
                }
                else if (spec.beachStatus == "pending") {
                    topLogs.push("Test was skipped by the developer");
                }
                else if (spec.beachStatus == "passed") {
                    topLogs.push("All passed");
                }
                if (spec.debugData.length > 0) {
                    addHeader("Debug Data:");
                }
                spec.debugData = topLogs.concat(spec.debugData);
                _this.stringLogs(spec);
            }
            // Increment and format values as all children have been processed
            _this.incrementIViewData(specOrSuite, data);
        });
        this.prettyProps(data);
    };
    BeachDayReporter.prototype.prettyProps = function (data) {
        data.durationFormatted = this.formatDuration(data.durationMilli);
        data.startTimeFormatted = moment(data.startTime).format("Do MMMM YYYY, HH:mm:ss");
        data.endTimeFormatted = moment(data.endTime).format("Do MMMM YYYY, HH:mm:ss");
    };
    BeachDayReporter.prototype.formatDuration = function (durationMilli) {
        var seconds = Math.floor(durationMilli / (1000));
        var mili = durationMilli - seconds * 1000;
        var miliStr = _.padStart(mili + "", 3, "0");
        var secondsStr = seconds + "";
        if (seconds > 60) {
            var mins = Math.floor(seconds / 60);
            seconds = seconds - mins * 60;
            secondsStr = mins + "m " + secondsStr;
        }
        return secondsStr + "." + miliStr + "s";
    };
    BeachDayReporter.prototype.initIViewData = function (value) {
        if (value) {
            if (!value.hasOwnProperty("isSpec")) {
                value.isSpec = false;
            }
            if (value.viewChildren == null)
                value.viewChildren = [];
            if (value.durationMilli == null)
                value.durationMilli = 0;
            if (value.failedCount == null)
                value.failedCount = 0;
            if (value.skippedCount == null)
                value.skippedCount = 0;
            if (value.notRunCount == null)
                value.notRunCount = 0;
            if (value.passedCount == null)
                value.passedCount = 0;
            if (value.implementationErrorCount == null)
                value.implementationErrorCount = 0;
            if (value.debugData == null)
                value.debugData = [];
            if (!value.hasOwnProperty("allPassed"))
                value.allPassed = true;
            if (!value.hasOwnProperty("durationWarning"))
                value.durationWarning = false;
            value.colorClass = function () {
                if (this.isSpec && this.failedCount == 0 && this.notRunCount == 0 && this.skippedCount == 0) {
                    return "green";
                }
                else if (!this.isSpec && this.passedCount > 0 && this.failedCount == 0 && this.notRunCount == 0) {
                    return "green";
                }
                else if (this.failedCount > 0) {
                    return "red";
                }
                else {
                    return "muted";
                }
            };
            value.iconClass = function () {
                if (this.isSpec && this.failedCount == 0 && this.notRunCount == 0 && this.skippedCount == 0) {
                    return "glyphicon-ok green";
                }
                else if (!this.isSpec && this.passedCount > 0 && this.failedCount == 0 && this.notRunCount == 0) {
                    return "glyphicon-ok green";
                }
                else if (this.failedCount > 0) {
                    return "glyphicon-remove red";
                }
                else {
                    return "glyphicon-question-sign muted";
                }
            };
        }
        return value;
    };
    BeachDayReporter.prototype.incrementIViewData = function (source, dest) {
        if (dest && source) {
            dest.startTime = this.getDate(dest.startTime, source.startTime, true);
            dest.endTime = this.getDate(dest.endTime, source.endTime, false);
            dest.durationMilli += source.durationMilli;
            dest.failedCount += source.failedCount;
            dest.skippedCount += source.skippedCount;
            dest.notRunCount += source.notRunCount;
            dest.passedCount += source.passedCount;
            dest.implementationErrorCount += source.implementationErrorCount;
            if (!source.allPassed) {
                dest.allPassed = false;
            }
            if (source.durationWarning) {
                dest.durationWarning = true;
            }
        }
    };
    BeachDayReporter.prototype.getDate = function (date1, date2, earliest) {
        if (date1 == null && date2 != null) {
            return date2;
        }
        else if (date1 != null && date2 == null) {
            return date1;
        }
        else {
            var d1Compare = earliest ? date1.getTime() < date2.getTime() : date1.getTime() > date2.getTime();
            if (d1Compare) {
                return date1;
            }
            else {
                return date2;
            }
        }
    };
    BeachDayReporter.prototype.stringLogs = function (data) {
        for (var i = 0; i < data.debugData.length; i++) {
            var newArgs = [];
            if (data.debugData[i] instanceof Array) {
                var args = data.debugData[i];
                for (var a = 0; a < args.length; a++) {
                    var item = args[a];
                    if (typeof item == "object") {
                        var result = stringifyObject(item, { singleQuotes: false }).replace(/(\r\n|\n|\r|\t)/gm, "");
                        newArgs.push(result);
                    }
                    else {
                        newArgs.push(item);
                    }
                }
            }
            else {
                newArgs.push(data.debugData[i]);
            }
            data.debugData[i] = newArgs.join(" ");
        }
    };
    BeachDayReporter.STATUS_PASSED = "passed";
    BeachDayReporter.STATUS_FAILED = "failed";
    BeachDayReporter.STATUS_SKIPPED = "pending";
    BeachDayReporter.STATUS_NOT_RUN = "notRun";
    return BeachDayReporter;
}());
exports.BeachDayReporter = BeachDayReporter;
