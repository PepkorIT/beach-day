"use strict";
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var ObjectUtils_1 = require("./ObjectUtils");
var counter = 0;
var JasmineAsyncEnv = (function () {
    function JasmineAsyncEnv(linkedEnv) {
        this.linkedEnv = linkedEnv;
        this.failed = false;
        this.id = counter;
        counter++;
    }
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
