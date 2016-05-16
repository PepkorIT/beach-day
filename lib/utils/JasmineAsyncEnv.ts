import {ReporterAPI} from "../reporter/BeachDayReporter";
import ObjectUtils from "./ObjectUtils";
import {TestUtils} from "./TestUtils";

var counter = 0;

export class JasmineAsyncEnv {
    public id:number;
    public currentBody:any;

    public failed:boolean = false;
    public done:() => void;

    constructor(public linkedEnv?:JasmineAsyncEnv){
        this.id = counter;
        counter++;
    }

    public wrap(cb:(env:JasmineAsyncEnv) => void):(done) => void {
        var _self = this;

        return function(done)  {
            // check for a linkedEnv and clone any dynamic properties
            // this allows us to have a starting point for the environment
            if (_self.linkedEnv != null) {
                var exceptions = {id:true, currentBody:true, linkedEnv:true};
                for (var propName in _self.linkedEnv){
                    if (_self.linkedEnv.hasOwnProperty(propName) && typeof _self.linkedEnv[propName] != "function" && !exceptions[propName]){
                        _self[propName] = _self.linkedEnv[propName];
                    }
                }
                // trash the linked env so no changes are made after the initial test
                _self.linkedEnv = null;
            }

            ReporterAPI.setCurrentEnvironment(_self);
            _self.done = function(){
                // hook to do stuff when complete
                done();
            };
            if (_self.failed === true){
                expect(_self).toBePassing();
                _self.done();
            }
            else{
                cb(_self);
            }
        }
    }

    public setProp(destinationName:string, sourceName:string):any {
        if (destinationName == null) throw new Error("destinationName cannot be null");
        this[destinationName] = this.checkProp(sourceName);
        return this[destinationName];
    }

    public checkProps(...propertyNames:Array<string>):void {
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

    /**
     * Makes sure the supplied property doesn't exist on the currentBody
     * @param propertyName
     * @returns Returns the value found on currentBody using the property name
     */
    public checkPropDoesntExist(propertyName:string):any
    {
        if (propertyName == null) throw new Error("propertyName cannot be null");

        var currObject  = ObjectUtils.getProp(this.currentBody, propertyName);
        if (currObject != null){
            TestUtils.throwExpectError("Expected property '" + propertyName + "' NOT to be present on response");
        }
        return currObject;
    }
}
