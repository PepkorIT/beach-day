"use strict";
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var ObjectUtils_1 = require("./ObjectUtils");
var counter = 0;
var JasmineAsyncEnv = (function () {
    function JasmineAsyncEnv() {
        this.failed = false;
        this.id = counter;
        counter++;
    }
    JasmineAsyncEnv.prototype.wrap = function (cb) {
        var env = this;
        return function (done) {
            BeachDayReporter_1.setCurrentEnvironment(env);
            env.done = function () {
                // hook to do stuff when complete
                done();
            };
            if (env.failed === true) {
                expect(env).toBePassing();
                env.done();
            }
            else {
                cb(env);
            }
        };
    };
    JasmineAsyncEnv.prototype.setProp = function (destinationName, sourceName) {
        if (destinationName == null)
            throw new Error("destinationName cannot be null");
        this[destinationName] = this.checkProp(sourceName);
        return this[destinationName];
    };
    JasmineAsyncEnv.prototype.checkProps = function () {
        var propertyNames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            propertyNames[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < propertyNames.length; i++) {
            this.checkProp(propertyNames[i]);
        }
    };
    JasmineAsyncEnv.prototype.checkProp = function (sourceName) {
        if (sourceName == null)
            throw new Error("sourceName cannot be null");
        if (this.currentBody == null) {
            expect(this.currentBody).throwExpectError("Expected property '" + sourceName + "' to be present on response but response was " + this.currentBody);
        }
        else {
            var currObject = ObjectUtils_1.default.getProp(this.currentBody, sourceName);
            if (currObject == null) {
                expect(this.currentBody).throwExpectError("Expected property '" + sourceName + "' to be present on response but failed to locate it");
            }
            return currObject;
        }
    };
    return JasmineAsyncEnv;
}());
exports.JasmineAsyncEnv = JasmineAsyncEnv;
