import {ReporterAPI} from '../reporter/beach-day-reporter';
import ObjectUtils from './object-utils';
import {MatcherUtils} from './matcher-utils';

var counter = 0;

export class JasmineAsyncEnv {

    public id:number;

    /**
     * Property to hold the current data response from the server.
     * Utility methods on this class act upon this object.
     * @memberof! JasmineAsyncEnv#
     */
    public currentBody:any = undefined;

    /**
     * Indicates if any of the tests using this envionment have failed.
     * The wrap() method will not execute its callback on any further tests if this is true
     * @memberof! JasmineAsyncEnv#
     * @type {boolean}
     */
    public failed:boolean = false;

    /**
     * Should be called by the callback passed to wrap() to complete a test case.
     * By default all tests that use wrap() are setup async so need to call this method
     * @memberof! JasmineAsyncEnv#
     * @type {function}
     */
    public done:() => void = undefined;

    private builtInProps:{ [key:string]:boolean } = {};
    private isolatedProps:{ [key:string]:any }    = {};

    /**
     * @class
     * @name JasmineAsyncEnv
     * @description
     * Environment class that links a number tests in a sequence with the wrap() method.
     *
     * @param linkedEnv {JasmineAsyncEnv} Optional. Linked JasmineAsyncEnv to base the original this one on.
     */
    constructor(public linkedEnv?:JasmineAsyncEnv) {
        this.id = counter;
        counter++;

        Object.keys(this).forEach(key => this.builtInProps[key] = true);
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

        return function (done) {
            // check for a linkedEnv and clone any dynamic properties
            // this allows us to have a starting point for the environment
            if (_self.linkedEnv != null) {
                var exceptions = {id: true, currentBody: true, linkedEnv: true};
                for (var propName in _self.linkedEnv) {
                    if (_self.linkedEnv.hasOwnProperty(propName) && typeof _self.linkedEnv[propName] != 'function' && !exceptions[propName]) {
                        _self[propName] = _self.linkedEnv[propName];
                    }
                }
                // trash the linked env so no changes are made after the initial test
                _self.linkedEnv = null;
            }

            ReporterAPI.setCurrentEnvironment(_self);
            _self.done = function () {
                // hook to do stuff when complete
                done();
            };
            if (_self.failed === true) {
                expect(_self).toBePassing();
                _self.done();
            }
            else {
                cb(_self);
            }
        };
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
        if (destinationName == null) throw new Error('destinationName cannot be null');
        var value = this.checkProp(sourceName);
        if (value != null) {
            ObjectUtils.setProp(this, destinationName, value);
        }
        return value;
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
        for (var i = 0; i < properties.length; i++) {
            this.checkProp(properties[i]);
        }
    }


    /**
     * Utility method, used to check if a property exists on this.currentBody.
     * Property identifier propertyName is passed using string values that can contain dots and array accessors.
     * This means we can "try" access properties that would otherwise cause runtime errors without a lot of if statements.
     *
     * @memberof JasmineAsyncEnv
     *
     * @param propertyName {String} The identifier for the source property on this.currentBody
     * @returns {any} The value from this.currentBody[propertyName] if found
     */
    public checkProp(propertyName:string):any {
        return MatcherUtils.checkProp(this.currentBody, propertyName);
    }

    /**
     * Makes sure the supplied property doesn't exist on the currentBody
     * @memberof JasmineAsyncEnv
     *
     * @param propertyName
     * @returns Returns the value found on currentBody using the property name
     */
    public checkPropDoesntExist(propertyName:string):any {
        return MatcherUtils.checkPropDoesntExist(this.currentBody, propertyName);
    }

    /**
     * Utility method to check for a string based property on this.currentBody.
     * Will throw a descriptive expect().toBe() error if not found or not equal
     *
     * @param propertyName {String} The identifier for the property to match against on this.currentBody
     * @param expected {any} The expected value to check against
     * @param useExplicitEquality Weather to check using a != vs !==
     * @returns {any}
     */
    public expectProp(propertyName:string, expected:any, useExplicitEquality:boolean = false):any {
        return MatcherUtils.expectProp(this.currentBody, propertyName, expected, useExplicitEquality);
    }


    /**
     * Utility method to move all non built in properties on
     * the env into an isolated object with a name
     */
    public isolateEnvProperties<T = any>(propertyName:string):T {
        const store:T = <any>{};
        Object.keys(this).forEach(key => {
            if (!this.builtInProps[key]) {
                store[key] = this[key];
                delete this[key];
            }
        });
        this.isolatedProps[propertyName] = store;
        return store;
    }


    public getIsolate<T = any>(propertyName:string):T {
        return this.isolatedProps[propertyName];
    }
}
