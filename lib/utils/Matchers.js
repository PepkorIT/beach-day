"use strict";
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
        throwImplementationError: throwError,
        statusCodeToBe: function (util, customEqualityTesters) {
            return {
                compare: function (actual, expected) {
                    var result = { pass: actual == expected, message: null };
                    if (!result.pass) {
                        result.message = "Expected status code \"" + actual + "\" to be " + expected;
                    }
                    else {
                        result.message = "Expected status code \"" + actual + "\" NOT to be " + expected;
                    }
                    return result;
                }
            };
        }
    });
});
