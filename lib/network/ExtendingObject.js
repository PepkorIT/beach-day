"use strict";
var _ = require("lodash");
var ExtendingObject = (function () {
    function ExtendingObject() {
        this.extender = function (destValue, sourceValue, key, object, source) {
            var sourcePopulated = sourceValue != null && sourceValue != undefined;
            var destPopulated = destValue != null && destValue != undefined;
            var bothPopulated = destPopulated && sourcePopulated;
            var bothArrays = (destValue instanceof Array && sourceValue instanceof Array);
            var destObject = typeof destValue == "object" && !(destValue instanceof Array);
            var sourceObject = typeof sourceValue == "object" && !(sourceValue instanceof Array);
            var bothObjects = sourceObject && destObject;
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
            else if (sourcePopulated && sourceObject) {
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
