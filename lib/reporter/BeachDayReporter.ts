import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import {JasmineAsyncEnv} from "../utils/JasmineAsyncEnv";

interface IDataStore extends IViewData{
    suiteInfo:ISuiteInfo;
}
interface ISuiteInfo {
    totalSpecsDefined:number;
}

interface ICustomSuite extends jasmine.Suite, IViewData {
}
interface ICustomSpec extends jasmine.Spec, IViewData {
}

interface IViewData{
    parent?:ICustomSuite;
    childSuites?:Array<ICustomSuite>;
    specList?:Array<ICustomSpec>;

    startTime?:Date;
    endTime?:Date;

    durationMilli?:number;
    durationFormatted?:string;

    failedCount?:number;
    skippedCount?:number;
    notRunCount?:number;
    passedCount?:number;
    implementationErrorCount?:number;

    debugData?:Array<string>;
}

// Hook to allow the env to register itself with the reporter
var lastCreatedInstance:BeachDayReporter;
export function setCurrentEnvironment(env:JasmineAsyncEnv):void {
    lastCreatedInstance.currentEnvironment = env;
}
export function registerImplementationError():void {
    lastCreatedInstance.registerImplementationError();
}

export class BeachDayReporter{
    private dataStore:IDataStore;
    private currentSuite:ICustomSuite;
    private _currentEnvironment:JasmineAsyncEnv;
    private currentSpec:ICustomSpec;

    constructor(){
        lastCreatedInstance = this;
    }

    public set currentEnvironment(env:JasmineAsyncEnv) {
        //console.log("New envonment set on the reporter: ", env);
        this._currentEnvironment = env;
    }

    public registerImplementationError():void {
        this.currentSpec.implementationErrorCount += 1;
    }

    public jasmineStarted(suiteInfo:ISuiteInfo):void {
        this.dataStore = {suiteInfo:suiteInfo};
        this.initIViewData(this.dataStore);
    }

    public suiteStarted(result:ICustomSuite):void {
        result.startTime    = new Date();
        // Build a tree
        result.childSuites  = [];
        result.specList     = [];

        // Assign the parent and child
        if (this.currentSuite){
            result.parent   = this.currentSuite;
            this.currentSuite.childSuites.push(result);
        }
        else{
            result.parent   = null;
            this.dataStore.childSuites.push(result);
        }
        // Set the current suite for the end or for the next suite
        this.currentSuite  = result;
        this.initIViewData(this.currentSuite);
    }

    public suiteDone(result:ICustomSuite):void {
        // Reassign back to the parent, may be null
        this.currentSuite   = result.parent;
        result.endTime      = new Date();
    }

    public specStarted(result:ICustomSpec):void {
        result.startTime    = new Date();
        this.currentSpec    = result;
        this.initIViewData(this.currentSpec);
        this.currentSuite.specList.push(result);
    }

    public specDone(result:ICustomSpec):void {
        result.endTime      = new Date();
        this.currentSpec    = null;
        if (this._currentEnvironment){
            // If the environment is already failed, then set the status to not run
            if (this._currentEnvironment.failed === true){
                result["status"] = "notRun";
            }
            else{
                // If the test failed, fail the entire environment
                if (result["status"] == "failed"){
                    this._currentEnvironment.failed = true;
                }
            }
        }
    }

    public jasmineDone(result:any):void {
        try{
            this.buildReport(this.dataStore);
        }
        catch (e){
            console.error(e.stack);
        }
    }

    private buildReport(data:IDataStore):void {
        // Strip the parents in the specs
        this.recurseSuitesPopulateViewData(data);

        var reportDir = path.join(process.cwd(), "reports");
        if (!fs.existsSync(reportDir)){
            fs.mkdirSync(reportDir);
        }
        fs.writeFileSync(reportDir +  "/data.json", JSON.stringify(data, null, 4), {encoding:"utf8"});
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
                spec.durationMilli              = spec.endTime.getTime() - spec.startTime.getTime();
                spec.skippedCount               = spec["status"] == "skipped" ? 1 : 0;
                spec.failedCount                = spec["status"] == "failed" ? 1 : 0;
                spec.notRunCount                = spec["status"] == "notRun" ? 1 : 0;
                spec.passedCount                = spec["status"] == "passed" ? 1 : 0;
                spec.debugData                  = []; // TODO: Implement

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

                // TODO: Populate spec duration formatted

                // Copy spec data onto parent suite
                this.incrementIViewData(spec, suite);
            });

            // Copy data from child suite to parent suite
            this.incrementIViewData(suite, data);

            // TODO: Populate duration formatted for suite


            // Delete circular reference before we finish
            delete suite.parent;
        });
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
}