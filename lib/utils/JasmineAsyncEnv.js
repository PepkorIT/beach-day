"use strict";
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var JasmineAsyncEnv = (function () {
    function JasmineAsyncEnv() {
        this.failed = false;
        beforeAll(function () {
            jasmine.addMatchers({
                toBePassing: function (util, customEqualityTesters) {
                    return {
                        compare: function (actual) {
                            return {
                                pass: !actual.failed,
                                message: "Expected the environment to be in a passing state"
                            };
                        }
                    };
                }
            });
        });
    }
    JasmineAsyncEnv.prototype.wrap = function (cb) {
        var env = this;
        BeachDayReporter_1.setCurrentEnvironment(this);
        return function (done) {
            var self = this;
            env.done = function () {
                // hook to do stuff when complete
                done();
            };
            if (env.failed === true) {
                expect(env).toBePassing();
                done();
            }
            else {
                cb(env);
            }
        };
    };
    return JasmineAsyncEnv;
}());
exports.JasmineAsyncEnv = JasmineAsyncEnv;
