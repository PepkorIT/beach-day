import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import Suite = jasmine.Suite;


interface IDataStore {
    suiteInfo:ISuiteInfo;
    suites:Array<ICustomSuite>;
}
interface ISuiteInfo {
    totalSpecsDefined:number;
}

interface ICustomSuite extends jasmine.Suite {
    startTime:Date;
    endTime:Date;
    parent:ICustomSuite;
    childSuites:Array<ICustomSuite>;
    specList:Array<ICustomSpec>;
}
interface ICustomSpec extends jasmine.Spec {
    startTime:Date;
    endTime:Date;
}

export class BeachDayReporter{
    private dataStore:IDataStore;
    private currentSuite:ICustomSuite;

    public jasmineStarted(suiteInfo:ISuiteInfo):void {
        this.dataStore = {suiteInfo:suiteInfo, suites:[]};
    }

    public suiteStarted(result:ICustomSuite):void {
        result.startTime    = new Date();
        // Build a tree
        result.childSuites  = [];
        result.specList     = [];
        result.parent       = null;
        this.dataStore.suites.push(result);

        // Assign the parent and child
        if (this.currentSuite){
            result.parent   = this.currentSuite;
            this.currentSuite.childSuites.push(result);
        }
        // Set the current suite for the end or for the next suite
        this.currentSuite  = result;
    }

    public suiteDone(result:ICustomSuite):void {
        // Reassign back to the parent, may be null
        this.currentSuite   = result.parent;
        result.endTime      = new Date();
    }

    public specStarted(result:ICustomSpec):void {
        result.startTime = new Date();
        this.currentSuite.specList.push(result);
    }

    public specDone(result:ICustomSpec):void {
        result.endTime = new Date();
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
        this.recurse(data.suites, function(source, property){
            delete source.parent;
        });

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
    private recurse(data:any, cb:any):void {
        if (data instanceof Array){
            for (var i = 0; i < data.length; i++) {
                if (typeof data[i] == "object") this.recurse(data[i], cb);
            }
        }
        else {
            for (var propName in data){
                cb(data, propName);
                if (typeof data[propName] == "object") this.recurse(data[propName], cb);
            }
        }
    }
}