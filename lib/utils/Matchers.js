"use strict";
var registered = false;
exports.Matchers = {
    registerMatchers: function () {
        if (registered) {
            return;
        }
        else if (typeof beforeEach == "function") {
            registered = true;
            beforeEach(function () {
                function throwError(util, customEqualityTesters) {
                    return {
                        compare: function (actual, expected) {
                            return {
                                pass: false,
                                message: expected
                            };
                        }
                    };
                }
                jasmine.addMatchers({
                    toBePassing: function (util, customEqualityTesters) {
                        return {
                            compare: function (actual) {
                                return {
                                    pass: !actual.failed,
                                    message: "Expected all previous tests to have passed"
                                };
                            }
                        };
                    },
                    throwExpectError: throwError,
                    throwImplementationError: throwError
                });
            });
        }
    }
};
