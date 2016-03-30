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
    parent?:ICustomSuite;
    childSuites?:Array<ICustomSuite>;
    specList?:Array<ICustomSpec>;

    startTime?:Date;
    startTimeFormatted?:string;
    endTime?:Date;
    endTimeFormatted?:string;

    durationMilli?:number;
    durationFormatted?:string;

    failedCount?:number;
    skippedCount?:number;
    notRunCount?:number;
    passedCount?:number;
    implementationErrorCount?:number;

    debugData?:Array<any>;
}

export interface IReporterConfig {
    reportPath?:string;
    viewDataPath?:string;
    headerTemplatePath?:string;
    indexTemplatePath?:string;
    reportTreeTemplatePath?:string;
    stylesPath?:string;
    titleTemplatePath?:string;
    includeAllConsoleLogs?:boolean;
}
export class ReporterConfig implements IReporterConfig{
    public reportPath:string;
    public viewDataPath:string;
    public headerTemplatePath:string;
    public indexTemplatePath:string;
    public reportTreeTemplatePath:string;
    public stylesPath:string;
    public titleTemplatePath:string;
    public includeAllConsoleLogs:boolean;

    constructor(config:IReporterConfig = {}){
        // Default to sensible locations and templates
        this.reportPath             = config.reportPath ? config.reportPath : path.join(process.cwd(), "reports", "report.html");
        this.viewDataPath           = path.join(process.cwd(), "reports", "data.json");
        this.headerTemplatePath     = config.headerTemplatePath ? config.headerTemplatePath : path.resolve(__dirname, "../templates/header.mustache");
        this.indexTemplatePath      = config.indexTemplatePath ? config.indexTemplatePath : path.resolve(__dirname, "../templates/index.mustache");
        this.reportTreeTemplatePath = config.reportTreeTemplatePath ? config.reportTreeTemplatePath : path.resolve(__dirname, "../templates/reportTree.mustache");
        this.stylesPath             = config.stylesPath ? config.stylesPath : path.resolve(__dirname, "../templates/styles.scss");
        this.titleTemplatePath      = config.titleTemplatePath ? config.titleTemplatePath : path.resolve(__dirname, "../templates/title.mustache");
        this.includeAllConsoleLogs  = config.hasOwnProperty("includeAllConsoleLogs") ? config.includeAllConsoleLogs : false;
    }

    public get reportDir():string {
        return path.dirname(this.reportPath);
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
export function registerImplementationError():void {
    lastCreatedInstance.registerImplementationError();
}

// Store refs before they are overridden
var consoleOrig = global.console;
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

var reporterConsole = new ReporterConsole();
export var console = reporterConsole;

export class BeachDayReporter{
    private dataStore:IDataStore;
    private currentSuite:ICustomSuite;
    private _currentEnvironment:JasmineAsyncEnv;
    private currentSpec:ICustomSpec;
    private config:ReporterConfig;

    constructor(config?:ReporterConfig){
        if (config && !(config instanceof ReporterConfig)){
            config = new ReporterConfig(config);
        }
        this.config             = config == null ? new ReporterConfig() : config;
        lastCreatedInstance     = this;

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
        //console.log("New envonment set on the reporter: ", env);
        this._currentEnvironment = env;
    }

    public registerImplementationError():void {
        this.currentSpec.implementationErrorCount += 1;
    }

    private wrap(cb:Function):void {
        try{
            cb();
        }
        catch (e){
            console.log(e.stack);
        }
    }

    public jasmineStarted(suiteInfo:ISuiteInfo):void {
        this.wrap(() => {
            this.dataStore = {suiteInfo:suiteInfo};
            this.initIViewData(this.dataStore);
        })
    }

    public suiteStarted(result:ICustomSuite):void {
        this.wrap(() => {
            result.startTime = new Date();
            // Build a tree
            result.childSuites = [];
            result.specList = [];

            // Assign the parent and child
            if (this.currentSuite) {
                result.parent = this.currentSuite;
                this.currentSuite.childSuites.push(result);
            }
            else {
                result.parent = null;
                this.dataStore.childSuites.push(result);
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
            result.startTime = new Date();
            this.currentSpec = result;
            this.initIViewData(this.currentSpec);
            this.currentSuite.specList.push(result);
            reporterConsole.currentSpec = this.currentSpec;
        });
    }

    public specDone(result:ICustomSpec):void {
        this.wrap(() => {
            result.endTime      = new Date();
            this.currentSpec    = null;

            // Clone the status so we can edit it without interfering with other reporters
            result.beachStatus  = result["status"];

            if (this._currentEnvironment){
                // If the environment is already failed, then set the status to not run
                if (this._currentEnvironment.failed === true){
                    result.beachStatus = "notRun";
                }
                else{
                    // If the test failed, fail the entire environment
                    if (result.beachStatus == "failed"){
                        this._currentEnvironment.failed = true;
                    }
                }
            }
        })
    }

    public jasmineDone(result:any):void {
        this.wrap(() => {
            // Strip the parents in the specs
            this.recurseSuitesPopulateViewData(this.dataStore);

            // TODO: Remove
            if (!fs.existsSync(this.config.reportDir)){
                fs.mkdirSync(this.config.reportDir);
            }
            fs.writeFileSync(this.config.viewDataPath, JSON.stringify(this.dataStore, null, 4), {encoding:"utf8"});

            generateReport(this.dataStore, this.config);
        });
    }




    /*
    UTIL FUNCTIONS
    --------------------------------------------
    */
    private recurseSuitesPopulateViewData(data:IViewData):void {

        data.childSuites.forEach((suite) => {

            // Recurse to the next level
            this.recurseSuitesPopulateViewData(suite);

            suite.specList.forEach((spec) => {

                // Build up data
                spec.durationMilli      = spec.endTime.getTime() - spec.startTime.getTime();
                spec.skippedCount       = spec.beachStatus == "skipped" ? 1 : 0;
                spec.failedCount        = spec.beachStatus == "failed" ? 1 : 0;
                spec.notRunCount        = spec.beachStatus == "notRun" ? 1 : 0;
                spec.passedCount        = spec.beachStatus == "passed" ? 1 : 0;

                // Add implementation errors if there are any
                if (spec["failedExpectations"]){
                    for (var i = 0; i < spec["failedExpectations"].length; i++) {
                        var expect = spec["failedExpectations"][i];
                        // If we find any failed expectations without a matcher name it means a runtime error
                        if (expect.matcherName == "" || expect.matcherName == null){
                            spec.implementationErrorCount = 1;
                        }
                    }
                }
                // Pretty formatting
                this.prettyProps(spec);

                this.stringLogs(spec);

                // Copy spec data onto parent suite
                this.incrementIViewData(spec, suite);
            });

            // Copy data from child suite to parent suite
            this.incrementIViewData(suite, data);

            // Pretty formatting
            this.prettyProps(suite);

            // Delete circular reference before we finish
            delete suite.parent;
        });

        // Pretty formatting
        data.durationFormatted = this.formatDuration(data.durationMilli);
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
            if (value.childSuites == null) value.childSuites = [];
            if (value.specList == null) value.specList = [];
            if (value.durationMilli == null) value.durationMilli = 0;
            if (value.failedCount == null) value.failedCount = 0;
            if (value.skippedCount == null) value.skippedCount = 0;
            if (value.notRunCount == null) value.notRunCount = 0;
            if (value.passedCount == null) value.passedCount = 0;
            if (value.implementationErrorCount == null) value.implementationErrorCount = 0;
            if (value.debugData == null) value.debugData = [];
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
            var args:Array<any>         = data.debugData[i];
            var newArgs:Array<string>   = [];

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

            data.debugData[i] = newArgs.join(" ");
        }
    }
}