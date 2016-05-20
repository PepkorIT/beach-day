"use strict";
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var ObjectUtils_1 = require("./ObjectUtils");
var TestUtils_1 = require("./TestUtils");
var counter = 0;
var JasmineAsyncEnv = (function () {
    /**
     * @class
     * @name JasmineAsyncEnv
     * @description
     * Environment class that links a number tests in a sequence with the wrap() method.
     *
     * @param linkedEnv {JasmineAsyncEnv} Optional. Linked JasmineAsyncEnv to base the original this one on.
     */
    function JasmineAsyncEnv(linkedEnv) {
        this.linkedEnv = linkedEnv;
        /**
         * Property to hold the current data response from the server.
         * Utility methods on this class act upon this object.
         * @memberof! JasmineAsyncEnv#
         */
        this.currentBody = undefined;
        /**
         * Indicates if any of the tests using this envionment have failed.
         * The wrap() method will not execute its callback on any further tests if this is true
         * @memberof! JasmineAsyncEnv#
         * @type {boolean}
         */
        this.failed = false;
        /**
         * Should be called by the callback passed to wrap() to complete a test case.
         * By default all tests that use wrap() are setup async so need to call this method
         * @memberof! JasmineAsyncEnv#
         * @type {function}
         */
        this.done = undefined;
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
    JasmineAsyncEnv.prototype.wrap = function (cb) {
        var _self = this;
        return function (done) {
            // check for a linkedEnv and clone any dynamic properties
            // this allows us to have a starting point for the environment
            if (_self.linkedEnv != null) {
                var exceptions = { id: true, currentBody: true, linkedEnv: true };
                for (var propName in _self.linkedEnv) {
                    if (_self.linkedEnv.hasOwnProperty(propName) && typeof _self.linkedEnv[propName] != "function" && !exceptions[propName]) {
                        _self[propName] = _self.linkedEnv[propName];
                    }
                }
                // trash the linked env so no changes are made after the initial test
                _self.linkedEnv = null;
            }
            BeachDayReporter_1.ReporterAPI.setCurrentEnvironment(_self);
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
    };
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
    JasmineAsyncEnv.prototype.setProp = function (destinationName, sourceName) {
        if (destinationName == null)
            throw new Error("destinationName cannot be null");
        var value = this.checkProp(sourceName);
        if (value != null) {
            ObjectUtils_1.default.setProp(this, destinationName, value);
        }
        return value;
    };
    /**
     * Utility method, used to check if an array of properties exist on this.currentBody
     * @see JasmineAsyncEnv#checkProp
     *
     * @memberof JasmineAsyncEnv
     *
     * @param properties {Array} List of properties to check
     */
    JasmineAsyncEnv.prototype.checkProps = function () {
        var properties = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            properties[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < properties.length; i++) {
            this.checkProp(properties[i]);
        }
    };
    /**
     * Utility method, used to check if a propery exists on this.currentBody.
     * Property identifier propertyName is passed using string values that can contain dots and array accessors.
     * This means we can "try" access properties that would otherwise cause runtime errors without a lot of if statements.
     *
     * @memberof JasmineAsyncEnv
     *
     * @param propertyName {String} The identifier for the source property on this.currentBody
     * @returns {any} The value from this.currentBody[propertyName] if found
     */
    JasmineAsyncEnv.prototype.checkProp = function (propertyName) {
        if (propertyName == null)
            throw new Error("propertyName cannot be null");
        if (this.currentBody == null) {
            expect(this.currentBody).throwExpectError("Expected property '" + propertyName + "' to be present on response but response was " + this.currentBody);
        }
        else {
            var currObject = ObjectUtils_1.default.getProp(this.currentBody, propertyName);
            if (currObject == null) {
                expect(this.currentBody).throwExpectError("Expected property '" + propertyName + "' to be present on response but failed to locate it");
            }
            return currObject;
        }
    };
    /**
     * Makes sure the supplied property doesn't exist on the currentBody
     * @memberof JasmineAsyncEnv
     *
     * @param propertyName
     * @returns Returns the value found on currentBody using the property name
     */
    JasmineAsyncEnv.prototype.checkPropDoesntExist = function (propertyName) {
        if (propertyName == null)
            throw new Error("propertyName cannot be null");
        var currObject = ObjectUtils_1.default.getProp(this.currentBody, propertyName);
        if (currObject != null) {
            TestUtils_1.TestUtils.throwExpectError("Expected property '" + propertyName + "' NOT to be present on response");
        }
        return currObject;
    };
    return JasmineAsyncEnv;
}());
exports.JasmineAsyncEnv = JasmineAsyncEnv;
