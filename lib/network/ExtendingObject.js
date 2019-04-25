"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var ExtendingObject = /** @class */ (function () {
    function ExtendingObject() {
        this.extender = function (destValue, sourceValue, key, object, source) {
            var sourcePopulated = sourceValue != null && sourceValue != undefined;
            var destPopulated = destValue != null && destValue != undefined;
            var bothPopulated = destPopulated && sourcePopulated;
            var sourceArray = (sourceValue instanceof Array);
            var destArray = (sourceValue instanceof Array);
            var bothArrays = (destArray && sourceArray);
            var destObject = typeof destValue == "object" && !(destValue instanceof Array);
            var sourceObject = typeof sourceValue == "object" && !(sourceValue instanceof Array);
            var bothObjects = sourceObject && destObject;
            var result;
            // Array checks
            if (bothArrays && bothPopulated) {
                //if (key == "checkRequestSchema") console.log("array merge");
                result = [];
                result = result.concat(destValue);
                result = result.concat(sourceValue);
            }
            else if (sourceArray && !destPopulated) {
                result = [].concat(sourceValue);
            }
            // Object checks
            else if (bothPopulated && bothObjects) {
                //if (key == "checkRequestSchema") console.log("object merge");
                result = _.extend({}, destValue, sourceValue);
            }
            else if (sourcePopulated && sourceObject) {
                result = _.extend({}, destValue, sourceValue);
            }
            // Otherwise
            else {
                //if (key == "checkRequestSchema") console.log("undefined check");
                result = sourceValue == undefined || sourceValue == null ? destValue : sourceValue;
            }
            //if (key == "checkRequestSchema") console.log(`merge for ${key} result: ${result}. destValue: ${destValue}, sourceValue: ${sourceValue}`);
            return result;
        };
    }
    return ExtendingObject;
}());
exports.ExtendingObject = ExtendingObject;
