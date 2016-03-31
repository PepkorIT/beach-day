import {setCurrentEnvironment, clearCurrentEnvironment} from "../reporter/BeachDayReporter";
import ObjectUtils from "./ObjectUtils";

var counter = 0;

export class JasmineAsyncEnv {
    public id:number;
    public currentBody:any;

    public failed:boolean = false;
    public done:() => void;

    constructor(){
        this.id = counter;
        counter++;
    }

    public wrap(cb:(env:JasmineAsyncEnv) => void):(done) => void {
        var env = this;

        return function(done)  {
            setCurrentEnvironment(env);
            env.done = function(){
                // hook to do stuff when complete
                done();
            };
            if (env.failed === true){
                expect(env).toBePassing();
                env.done();
            }
            else{
                cb(env);
            }
        }
    }

    public setProp(destinationName:string, sourceName:string):any {
        if (destinationName == null) throw new Error("destinationName cannot be null");
        this[destinationName] = this.checkProp(sourceName);
        return this[destinationName];
    }

    public checkProps(...propertyNames:Array<string>){
        for (var i = 0; i < propertyNames.length; i++){
            this.checkProp(propertyNames[i]);
        }
    }

    public checkProp(sourceName:string):any {
        if (sourceName == null) throw new Error("sourceName cannot be null");

        if (this.currentBody == null){
            expect(this.currentBody).throwExpectError("Expected property '" + sourceName + "' to be present on response but response was " + this.currentBody);
        }
        else{
            var currObject  = ObjectUtils.getProp(this.currentBody, sourceName);
            if (currObject == null){
                expect(this.currentBody).throwExpectError("Expected property '" + sourceName + "' to be present on response but failed to locate it");
            }
            return currObject;
        }
    }
}
