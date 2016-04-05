import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import { JasmineAsyncEnv } from "../utils/JasmineAsyncEnv";
import { generate as generateReport } from "./ReportGenerator"

// Non typescript dependencies
var moment          = require("moment");
var stringifyObject = require("stringify-object");


/*
Declarations
--------------------------------------------
*/
export interface IDataStore extends IViewData{
    suiteInfo:ISuiteInfo;
    id:string;
    maxTestTime?:string;
}
export interface ISuiteInfo {
    totalSpecsDefined:number;
}

export interface ICustomSuite extends jasmine.Suite, IViewData {
}
export interface ICustomSpec extends jasmine.Spec, IViewData {
    beachStatus:string;
}

export interface IViewData{
    isSpec:boolean;
    level:number;

    parent?:ICustomSuite;
    viewChildren?:Array<IViewData>;

    startTime?:Date;
    startTimeFormatted?:string;
    endTime?:Date;
    endTimeFormatted?:string;

    durationMilli?:number;
    durationFormatted?:string;
    durationWarning?:boolean;

    failedCount?:number;
    skippedCount?:number;
    notRunCount?:number;
    passedCount?:number;
    implementationErrorCount?:number;
    allPassed?:boolean;
    colorClass?:Function;
    iconClass?:Function;

    debugData?:Array<any>;
}

export interface IReporterConfig {
    reportName?:string;
    reportDir?:string;
    viewDataPath?:string;
    headerTemplatePath?:string;
    indexTemplatePath?:string;
    suiteTemplatePath?:string;
    stylesPath?:string;
    titleTemplatePath?:string;
    summaryTemplatePath?:string;
    latestTemplatePath?:string;
    logToConsole?:boolean;
    includeAllConsoleLogs?:boolean;
    maxTestTime?:number;
}
export class ReporterConfig implements IReporterConfig{
    public reportName:string;
    public reportDir:string;
    public viewDataPath:string;
    public headerTemplatePath:string;
    public indexTemplatePath:string;
    public suiteTemplatePath:string;
    public stylesPath:string;
    public titleTemplatePath:string;
    public summaryTemplatePath:string;
    public latestTemplatePath:string;
    public logToConsole:boolean;
    public includeAllConsoleLogs:boolean;
    public maxTestTime:number;

    constructor(config:IReporterConfig = {}){
        // Default to sensible locations and templates
        this.reportName             = config.reportName ? config.reportName : "Report: " + (new Date()).toString();
        this.reportDir              = config.reportDir ? config.reportDir : path.join(process.cwd(), "reports");
        this.viewDataPath           = config.viewDataPath ? config.viewDataPath : path.join(process.cwd(), "reports", "data.json");
        this.headerTemplatePath     = config.headerTemplatePath ? config.headerTemplatePath : path.resolve(__dirname, "../templates/header.mustache");
        this.indexTemplatePath      = config.indexTemplatePath ? config.indexTemplatePath : path.resolve(__dirname, "../templates/index.mustache");
        this.suiteTemplatePath      = config.suiteTemplatePath ? config.suiteTemplatePath : path.resolve(__dirname, "../templates/suite.mustache");
        this.stylesPath             = config.stylesPath ? config.stylesPath : path.resolve(__dirname, "../templates/styles.scss");
        this.titleTemplatePath      = config.titleTemplatePath ? config.titleTemplatePath : path.resolve(__dirname, "../templates/title.mustache");
        this.summaryTemplatePath    = config.summaryTemplatePath ? config.summaryTemplatePath : path.resolve(__dirname, "../templates/summary.mustache");
        this.latestTemplatePath     = config.latestTemplatePath ? config.latestTemplatePath : path.resolve(__dirname, "../templates/latest.mustache");
        this.logToConsole           = config.hasOwnProperty("logToConsole") ? config.logToConsole : true;
        this.includeAllConsoleLogs  = config.hasOwnProperty("includeAllConsoleLogs") ? config.includeAllConsoleLogs : false;
        this.maxTestTime            = config.maxTestTime; // Default is not set
    }

    public get viewDataDir():string {
        return path.dirname(this.viewDataPath);
    }
    public get reportDynamicName():string {
        if (process.env.BEACH_DAY_REPORT_NAME){
            return process.env.BEACH_DAY_REPORT_NAME + ".html";
        }
        else{
            return null;
        }
    }
    public get reportDynamicPath():string {
        if (this.reportDynamicName){
            return path.join(this.reportDir, this.reportDynamicName);
        }
        else{
            return null;
        }
    }
    public get latestReportName():string {
        if (this.reportDynamicName){
            return this.reportDynamicName;
        }
        else{
            return "beach-day-report.html";
        }
    }
    public get reportStaticPath():string {
        return path.join(this.reportDir, "beach-day-report.html");
    }
}

/*
API
--------------------------------------------
*/

// Hook to allow the env to register itself with the reporter
var lastCreatedInstance:BeachDayReporter;
export function setCurrentEnvironment(env:JasmineAsyncEnv):void {
    lastCreatedInstance.currentEnvironment = env;
}
export function clearCurrentEnvironment():void {
    lastCreatedInstance.currentEnvironment = null;
}

// Store refs before they are overridden
export var consoleOrig = global.console;
var logOrig     = global.console.log;
var infoOrig    = global.console.info;
var debugOrig   = global.console.debug;
var warnOrig    = global.console.warn;
var errorOrig   = global.console.error;

export class ReporterConsole{

    public logToConsole:boolean = true;

    private _currentSpec:ICustomSpec;
    private cache:Array<any>;

    log = (...args: any[]):void => {
        this.store(args, logOrig);
    };
    info = (...args: any[]):void => {
        this.store(args, infoOrig);
    };
    debug = (...args: any[]):void => {
        this.store(args, debugOrig);
    };
    warn = (...args: any[]):void => {
        this.store(args, warnOrig);
    };
    error = (...args: any[]):void => {
        this.store(args, errorOrig);
    };

    public set currentSpec(value:ICustomSpec) {
        this._currentSpec = value;
        // Append the cached log lines
        if (this.cache){
            this._currentSpec.debugData = this._currentSpec.debugData.concat(this.cache);
            this.cache = null;
        }
    }

    private store(args:Array<any>, logger:Function):void{
        if (this._currentSpec) {
            this._currentSpec.debugData.push(args);
        }
        else {
            if (this.cache == null) this.cache = [];
            this.cache.push(args);
        }
        if (this.logToConsole){
            logger.apply(consoleOrig, args);
        }
    }
}

var reporterConsole             = new ReporterConsole();
reporterConsole.logToConsole    = false;
export var console              = reporterConsole;



export class  BeachDayReporter{
    private dataStore:IDataStore;
    private currentSuite:ICustomSuite;
    private _currentEnvironment:JasmineAsyncEnv;
    private currentSpec:ICustomSpec;
    private config:ReporterConfig;

    private static STATUS_PASSED    = "passed";
    private static STATUS_FAILED    = "failed";
    private static STATUS_SKIPPED   = "pending";
    private static STATUS_DISABLED  = "disabled";
    private static STATUS_NOT_RUN   = "notRun";

    constructor(config?:IReporterConfig){
        if (config && !(config instanceof ReporterConfig)){
            config = new ReporterConfig(config);
        }
        this.config             = config == null ? new ReporterConfig() : <ReporterConfig> config;
        lastCreatedInstance     = this;

        reporterConsole.logToConsole = config.logToConsole;

        // Override with our local proxy
        if (config.includeAllConsoleLogs){
            global.console.log      = reporterConsole.log;
            global.console.info     = reporterConsole.info;
            global.console.debug    = reporterConsole.debug;
            global.console.warn     = reporterConsole.warn;
            global.console.error    = reporterConsole.error;
        }
    }

    public set currentEnvironment(env:JasmineAsyncEnv) {
        this._currentEnvironment = env;
        //consoleOrig.log("----------> Setting current environment: ", env);
    }

    private wrap(cb:Function):void {
        try{
            cb();
        }
        catch (e){
            consoleOrig.log(e.stack);
        }
    }

    /*
    Jasmine methods
    --------------------------------------------
    */
    public jasmineStarted(suiteInfo:ISuiteInfo):void {
        this.wrap(() => {
            this.dataStore = {suiteInfo:suiteInfo, isSpec:false, id:(new Date()).getTime() + "", level:0};
            this.initIViewData(this.dataStore);
        })
    }

    public suiteStarted(result:ICustomSuite):void {
        this.wrap(() => {
            result.startTime = new Date();

            // Assign the parent and child
            if (this.currentSuite) {
                result.parent = this.currentSuite;
                this.currentSuite.viewChildren.push(result);
            }
            else {
                result.parent = null;
                this.dataStore.viewChildren.push(result);
            }
            // Set the current suite for the end or for the next suite
            this.currentSuite = result;
            this.initIViewData(this.currentSuite);
        });
    }

    public suiteDone(result:ICustomSuite):void {
        this.wrap(() => {
            // Reassign back to the parent, may be null
            this.currentSuite = result.parent;
            result.endTime = new Date();
        });
    }

    public specStarted(result:ICustomSpec):void {
        this.wrap(() => {
            result.startTime    = new Date();
            result.isSpec       = true;
            this.currentSpec    = result;
            this.initIViewData(this.currentSpec);
            this.currentSuite.viewChildren.push(result);
            reporterConsole.currentSpec = this.currentSpec;
        });
    }

    public specDone(result:ICustomSpec):void {
        this.wrap(() => {
            result.endTime      = new Date();

            // Clone the status so we can edit it without interfering with other reporters
            result.beachStatus  = result["status"];

            // Las the disabled status and simply treat as skipped
            if (result.beachStatus == BeachDayReporter.STATUS_DISABLED){
                result.beachStatus = BeachDayReporter.STATUS_SKIPPED;
            }

            if (this._currentEnvironment){
                // If the environment is already failed, then set the status to not run
                if (this._currentEnvironment.failed === true){
                    if (result.beachStatus != BeachDayReporter.STATUS_SKIPPED){
                        result.beachStatus = BeachDayReporter.STATUS_NOT_RUN;
                    }
                }
                else{
                    // If the test failed, fail the entire environment
                    if (result.beachStatus == BeachDayReporter.STATUS_FAILED){
                        this._currentEnvironment.failed = true;
                    }
                }
            }

            // Clear out the current environment
            // as this should be set by every env.wrap execution
            this.currentEnvironment = null;
            this.currentSpec        = null;
        })
    }

    public jasmineDone(result:any):void {
        this.wrap(() => {
            // Strip the parents in the specs
            this.recurseSuitesPopulateViewData(this.dataStore);

            if (this.config.maxTestTime){
                this.dataStore.maxTestTime = this.formatDuration(this.config.maxTestTime)
            }

            // Generate HTML report
            generateReport(this.dataStore, this.config);

            // Generate JSON from view data
            if (!fs.existsSync(this.config.viewDataDir)){
                fs.mkdirSync(this.config.viewDataDir);
            }
            fs.writeFileSync(this.config.viewDataPath, JSON.stringify(this.dataStore, null, 4), {encoding:"utf8"});
        });
    }




    /*
    UTIL FUNCTIONS
    --------------------------------------------
    */
    private recurseSuitesPopulateViewData(data:IViewData, level:number = 1):void {
        data.viewChildren.forEach((specOrSuite:IViewData) => {
            specOrSuite.level = level;

            if (!specOrSuite.isSpec){
                delete specOrSuite.parent;
                this.recurseSuitesPopulateViewData(specOrSuite, level + 1);
                this.prettyProps(specOrSuite);
            }
            else{
                // Build up data
                var spec                = <ICustomSpec> specOrSuite;
                spec.durationMilli      = spec.endTime.getTime() - spec.startTime.getTime();
                spec.skippedCount       = spec.beachStatus == BeachDayReporter.STATUS_SKIPPED ? 1 : 0;
                spec.failedCount        = spec.beachStatus == BeachDayReporter.STATUS_FAILED ? 1 : 0;
                spec.notRunCount        = spec.beachStatus == BeachDayReporter.STATUS_NOT_RUN ? 1 : 0;
                spec.passedCount        = spec.beachStatus == BeachDayReporter.STATUS_PASSED ? 1 : 0;
                spec.allPassed          = spec.passedCount == 1;

                if (this.config.maxTestTime != null && spec.durationMilli > this.config.maxTestTime){
                    spec.durationWarning = true;
                }
                this.prettyProps(specOrSuite);

                // Add log debug data
                var topLogs             = [];
                var addHeader = (name:string) => {
                    if (topLogs.length > 0) topLogs.push("");
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
                if (spec.beachStatus == "failed"){
                    // Set the spec so the logs go to the right place

                    for (var i = 0; i < spec["failedExpectations"].length; i++) {
                        var expect = spec["failedExpectations"][i];
                        // If we find any failed expectations without a matcher name it means a runtime error
                        if (expect.matcherName == "" || expect.matcherName == null){
                            spec.implementationErrorCount = 1;
                            topLogs.push("[TEST IMPLEMENTATION ERROR] - " + expect.stack);
                        }
                        // Specific matcher that throws implementation errors
                        else if (expect.matcherName == "throwImplementationError"){
                            spec.implementationErrorCount = 1;
                            topLogs.push("[TEST IMPLEMENTATION ERROR] - " + expect.message);
                        }
                        else{
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

                this.stringLogs(spec);
            }

            // Increment and format values as all children have been processed
            this.incrementIViewData(specOrSuite, data);
        });

        this.prettyProps(data);
    }

    private prettyProps(data:IViewData):void {
        data.durationFormatted  = this.formatDuration(data.durationMilli);
        data.startTimeFormatted = moment(data.startTime).format("Do MMMM YYYY, HH:mm:ss");
        data.endTimeFormatted   = moment(data.endTime).format("Do MMMM YYYY, HH:mm:ss");
    }

    private formatDuration(durationMilli:number):string {
        var seconds = Math.floor(durationMilli / (1000));
        var mili    = durationMilli - seconds * 1000;
        var miliStr = _.padStart(mili + "", 3, "0");

        var secondsStr  = seconds + "";
        if (seconds > 60){
            var mins    = Math.floor(seconds / 60);
            seconds     = seconds - mins * 60;
            secondsStr  = mins + "m " + secondsStr;
        }

        return secondsStr + "." + miliStr + "s";
    }

    private initIViewData(value:IViewData):IViewData {
        if (value){
            if (!value.hasOwnProperty("isSpec")) {
                value.isSpec = false;
            }
            if (value.viewChildren == null) value.viewChildren = [];
            if (value.durationMilli == null) value.durationMilli = 0;
            if (value.failedCount == null) value.failedCount = 0;
            if (value.skippedCount == null) value.skippedCount = 0;
            if (value.notRunCount == null) value.notRunCount = 0;
            if (value.passedCount == null) value.passedCount = 0;
            if (value.implementationErrorCount == null) value.implementationErrorCount = 0;
            if (value.debugData == null) value.debugData = [];
            if (!value.hasOwnProperty("allPassed")) value.allPassed = true;
            if (!value.hasOwnProperty("durationWarning")) value.durationWarning = false;

            value.colorClass = function(){
                if (this.isSpec && this.failedCount == 0 && this.notRunCount == 0 && this.skippedCount == 0){
                    return "green";
                }
                else if (!this.isSpec && this.passedCount > 0 && this.failedCount == 0 && this.notRunCount == 0){
                    return "green";
                }
                else if (this.failedCount > 0){
                    return "red";
                }
                else{
                    return "muted";
                }
            };
            value.iconClass = function(){
                if (this.isSpec && this.failedCount == 0 && this.notRunCount == 0 && this.skippedCount == 0){
                    return "glyphicon-ok green";
                }
                else if (!this.isSpec && this.passedCount > 0 && this.failedCount == 0 && this.notRunCount == 0){
                    return "glyphicon-ok green";
                }
                else if (this.failedCount > 0){
                    return "glyphicon-remove red";
                }
                else{
                    return "glyphicon-question-sign muted";
                }
            };
        }
        return value;
    }

    private incrementIViewData(source:IViewData, dest:IViewData):void {
        if (dest && source){
            dest.startTime                  = this.getDate(dest.startTime, source.startTime, true);
            dest.endTime                    = this.getDate(dest.endTime, source.endTime, false);
            dest.durationMilli              += source.durationMilli;
            dest.failedCount                += source.failedCount;
            dest.skippedCount               += source.skippedCount;
            dest.notRunCount                += source.notRunCount;
            dest.passedCount                += source.passedCount;
            dest.implementationErrorCount   += source.implementationErrorCount;
            if (!source.allPassed){
                dest.allPassed = false;
            }
            if (source.durationWarning){
                dest.durationWarning = true;
            }
        }
    }

    private getDate(date1:Date, date2:Date, earliest:boolean):Date {
        if (date1 == null && date2 != null){
            return date2;
        }
        else if (date1 != null && date2 == null){
            return date1;
        }
        else{
            var d1Compare = earliest ? date1.getTime() < date2.getTime() : date1.getTime() > date2.getTime();
            if (d1Compare){
                return date1;
            }
            else{
                return date2;
            }
        }
    }

    private stringLogs(data:IViewData):void {
        for (var i = 0; i < data.debugData.length; i++) {
            var newArgs:Array<string>   = [];
            if (data.debugData[i] instanceof Array){
                var args:Array<any>         = data.debugData[i];

                for (var a = 0; a < args.length; a++) {
                    var item = args[a];
                    if (typeof item == "object"){
                        var result = stringifyObject(item, {singleQuotes:false}).replace(/(\r\n|\n|\r|\t)/gm,"");
                        newArgs.push(result);
                    }
                    else{
                        newArgs.push(item);
                    }
                }
            }
            else{
                newArgs.push(data.debugData[i]);
            }

            data.debugData[i] = newArgs.join(" ");
        }
    }
}