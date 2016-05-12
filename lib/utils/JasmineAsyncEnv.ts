import {ReporterAPI} from "../reporter/BeachDayReporter";
import ObjectUtils from "./ObjectUtils";

var counter = 0;

export interface IJasmineAsyncEnv {
    id:number;
    currentBody:any;
    failed:boolean;
    done:() => void;
    wrap(cb:(env:JasmineAsyncEnv) => void):(done) => void;
    setProp(destinationName:string, sourceName:string):any;
    checkProps(...propertyNames:Array<string>):void;
    checkProp(sourceName:string):any;
}


export class JasmineAsyncEnv implements IJasmineAsyncEnv {
    public id:number;
    public currentBody:any;

    public failed:boolean = false;
    public done:() => void;

    /**
     * @class
     * @name JasmineAsyncEnv
     * @description
     * Environment class that links a number tests in a sequence with the wrap() method.
     *
     * @param linkedEnv {JasmineAsyncEnv} Optional. Linked JasmineAsyncEnv to base the original this one on.
     */
    constructor(public linkedEnv?:JasmineAsyncEnv){
        this.id = counter;
        counter++;
    }

    /**
     * Wrapper for a test method. The cb will only be executed if the all the previous tests have passed.
     * @memberof JasmineAsyncEnv
     *
     * @param cb {Function} The test method to wrap
     * @returns {Function} A function to pass to the jasmine it() method.
     */
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

    /**
     * Utility method, used to set a property from this.currentBody onto this object.
     * Property identifiers for source and destination are passed using string values that can contain dots and array accessors.
     * This means we can "try" access properties that would otherwise cause runtime errors without a lot of if statements.
     * If the sourceName is not found on this.currentBody no property is set
     *
     * @memberof JasmineAsyncEnv
     *
     * @param destinationName {String} The identifier for the destination property on this object
     * @param sourceName {String} The identifier for the source property on this.currentBody
     * @returns {any} The value from this.currentBody[sourceName] if found
     */
    public setProp(destinationName:string, sourceName:string):any {
        if (destinationName == null) throw new Error("destinationName cannot be null");
        this[destinationName] = this.checkProp(sourceName);
        return this[destinationName];
    }

    /**
     * Utility method, used to check if an array of properties exist on this.currentBody
     * @see JasmineAsyncEnv#checkProp
     *
     * @memberof JasmineAsyncEnv
     *
     * @param properties {Array} List of properties to check
     */
    public checkProps(...properties:Array<string>):void {
        for (var i = 0; i < properties.length; i++){
            this.checkProp(properties[i]);
        }
    }


    /**
     * Utility method, used to check if a propery exists on this.currentBody
     * Property identifier sourceName is passed using string values that can contain dots and array accessors.
     * This means we can "try" access properties that would otherwise cause runtime errors without a lot of if statements.
     *
     * @memberof JasmineAsyncEnv
     *
     * @param sourceName {String} The identifier for the source property on this.currentBody
     * @returns {any} The value from this.currentBody[sourceName] if found
     */
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
