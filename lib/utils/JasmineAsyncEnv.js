"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var ObjectUtils_1 = require("./ObjectUtils");
var MatcherUtils_1 = require("./MatcherUtils");
var counter = 0;
var JasmineAsyncEnv = /** @class */ (function () {
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
            properties[_i] = arguments[_i];
        }
        for (var i = 0; i < properties.length; i++) {
            this.checkProp(properties[i]);
        }
    };
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
    JasmineAsyncEnv.prototype.checkProp = function (propertyName) {
        return MatcherUtils_1.MatcherUtils.checkProp(this.currentBody, propertyName);
    };
    /**
     * Makes sure the supplied property doesn't exist on the currentBody
     * @memberof JasmineAsyncEnv
     *
     * @param propertyName
     * @returns Returns the value found on currentBody using the property name
     */
    JasmineAsyncEnv.prototype.checkPropDoesntExist = function (propertyName) {
        return MatcherUtils_1.MatcherUtils.checkPropDoesntExist(this.currentBody, propertyName);
    };
    /**
     * Utility method to check for a string based property on this.currentBody.
     * Will throw a descriptive expect().toBe() error if not found or not equal
     *
     * @param propertyName {String} The identifier for the property to match against on this.currentBody
     * @param expected {any} The expected value to check against
     * @param useExplicitEquality Weather to check using a != vs !==
     * @returns {any}
     */
    JasmineAsyncEnv.prototype.expectProp = function (propertyName, expected, useExplicitEquality) {
        if (useExplicitEquality === void 0) { useExplicitEquality = false; }
        return MatcherUtils_1.MatcherUtils.expectProp(this.currentBody, propertyName, expected, useExplicitEquality);
    };
    return JasmineAsyncEnv;
}());
exports.JasmineAsyncEnv = JasmineAsyncEnv;
