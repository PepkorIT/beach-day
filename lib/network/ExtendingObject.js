"use strict";
var _ = require("lodash");
var ExtendingObject = (function () {
    function ExtendingObject() {
        this.extender = function (destValue, sourceValue, key, object, source) {
            var bothPopulated = destValue != null && destValue != undefined && sourceValue != null && sourceValue != undefined;
            var bothArrays = (destValue instanceof Array && sourceValue instanceof Array);
            var bothObjects = (typeof destValue == "object" && !(destValue instanceof Array) && typeof sourceValue == "object" && !(sourceValue instanceof Array));
            var result;
            if (bothArrays && bothPopulated) {
                //if (key == "checkRequestSchema") console.log("array merge");
                result = [];
                result = result.concat(destValue);
                result = result.concat(sourceValue);
            }
            else if (bothPopulated && bothObjects) {
                //if (key == "checkRequestSchema") console.log("object merge");
                result = _.extend({}, destValue, sourceValue);
            }
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
