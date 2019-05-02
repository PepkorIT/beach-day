"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var test_utils_1 = require("./test-utils");
var object_utils_1 = require("./object-utils");
var stringifyObject = require('stringify-object');
var MatcherUtils = /** @class */ (function () {
    function MatcherUtils() {
    }
    MatcherUtils.checkProp = function (currentBody, propertyName) {
        if (propertyName == null)
            throw new Error('propertyName cannot be null');
        if (currentBody == null) {
            expect(currentBody).throwExpectError('Expected property \'' + propertyName + '\' to be present on response but response was ' + currentBody);
        }
        else {
            var currObject = object_utils_1.ObjectUtils.getProp(currentBody, propertyName);
            if (currObject == null) {
                expect(currentBody).throwExpectError('Expected property \'' + propertyName + '\' to be present on response but failed to locate it');
            }
            return currObject;
        }
    };
    MatcherUtils.checkPropDoesntExist = function (currentBody, propertyName) {
        if (propertyName == null)
            throw new Error('propertyName cannot be null');
        var currObject = object_utils_1.ObjectUtils.getProp(currentBody, propertyName);
        if (currObject != null) {
            test_utils_1.TestUtils.throwExpectError('Expected property \'' + propertyName + '\' NOT to be present on response');
        }
        return currObject;
    };
    MatcherUtils.expectProp = function (currentBody, propertyName, expected, useExplicitEquality) {
        if (useExplicitEquality === void 0) { useExplicitEquality = false; }
        if (propertyName == null)
            throw new Error('propertyName cannot be null');
        if (currentBody == null) {
            test_utils_1.TestUtils.throwExpectError("Expected property '" + propertyName + "' to be present on response but response was " + currentBody);
        }
        else {
            var value = object_utils_1.ObjectUtils.getProp(currentBody, propertyName, false);
            var stringify = function (value) {
                return stringifyObject(value, { singleQuotes: false }).replace(/(\r\n|\n|\r|\t)/gm, '');
            };
            if (!useExplicitEquality && value != expected) {
                test_utils_1.TestUtils.throwExpectError("Expected property '" + propertyName + "' with value: " + stringify(value) + " to be: " + stringify(expected));
            }
            else if (useExplicitEquality && value !== expected) {
                test_utils_1.TestUtils.throwExpectError("Expected property '" + propertyName + "' with value: " + stringify(value) + " to be: " + stringify(expected));
            }
            return value;
        }
    };
    return MatcherUtils;
}());
exports.MatcherUtils = MatcherUtils;
//# sourceMappingURL=matcher-utils.js.map