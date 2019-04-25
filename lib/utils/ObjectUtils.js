"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ObjectUtils = /** @class */ (function () {
    function ObjectUtils() {
    }
    ObjectUtils.getProp = function (source, propertyAccessor, convertUndefinedToNull) {
        if (convertUndefinedToNull === void 0) { convertUndefinedToNull = true; }
        if (source == null)
            return null;
        var currObject = source;
        var parts = propertyAccessor.split(".");
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part == "")
                continue;
            // If its an array selector
            if (part.indexOf("[") != -1) {
                // Assign the variable if present
                var varName = part.replace(/\[.+\]/g, "");
                if (varName != "") {
                    currObject = currObject[varName];
                    if (!(currObject instanceof Array)) {
                        //console.log("null curr obj: ", varName, currObject instanceof Array);
                        currObject = undefined;
                        break;
                    }
                }
                // Get only the number in the index
                var index = part.substr(part.indexOf("[") + 1).replace(/\]/g, "");
                //console.log(">>>>>>>>>> ", index);
                if (isNaN(Number(index)))
                    throw new Error("Invalid array index: " + index);
                currObject = currObject[Number(index)];
            }
            // Should have array selector in the part if the source is an array
            else if (currObject instanceof Array && part != "length") {
                console.log("Error on array selector");
                if (i == 0) {
                    parts.unshift("[missing here]");
                }
                else {
                    parts[i - 1] = parts[i - 1] + "[missing here]";
                }
                // Log a soft error as the data may be incorrect thereby causing this problem
                console.error("Invalid property selection. We encountered an array in the property selection but the next property selector in the string was not []: " + parts.join("."));
                currObject = null;
            }
            else {
                currObject = currObject[part];
            }
            if (currObject === null || currObject === undefined)
                break;
        }
        // Do default conversion for ease of use
        if (currObject === undefined && convertUndefinedToNull) {
            currObject = null;
        }
        return currObject;
    };
    ObjectUtils.setProp = function (target, propertyAccessor, value) {
        if (target == null)
            throw new Error("target must be populated");
        var currObject = target;
        var parts = propertyAccessor.split(".");
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part == "")
                continue;
            var isLast = i == parts.length - 1;
            // If its an array selector
            if (part.indexOf("[") != -1) {
                // Assign the variable if present
                var varName = part.replace(/\[.+\]/g, "");
                if (varName != "") {
                    // Create missing place holder array
                    if (!currObject.hasOwnProperty(varName) || currObject[varName] == null)
                        currObject[varName] = [];
                    currObject = currObject[varName];
                }
                // Get only the number in the index
                var index = part.substr(part.indexOf("[") + 1).replace(/\]/g, "");
                if (isNaN(Number(index)))
                    throw new Error("Invalid array index: " + index);
                if (isLast) {
                    currObject[Number(index)] = value;
                }
                else {
                    currObject = currObject[Number(index)];
                }
            }
            // Error handler, should have array selector in the part if the source is an array
            else if (currObject instanceof Array && part != "length") {
                console.log("Error on array selector");
                if (i == 0) {
                    parts.unshift("[missing here]");
                }
                else {
                    parts[i - 1] = parts[i - 1] + "[missing here]";
                }
                // Log a soft error as the data may be incorrect thereby causing this problem
                console.error("Invalid property selection. We encountered an array in the property selection but the next property selector in the string was not []: " + parts.join("."));
                break;
            }
            else {
                // Create missing place holder object
                if (!currObject.hasOwnProperty(part) || currObject[part] == null)
                    currObject[part] = {};
                // Reset using the value if the last element
                if (isLast) {
                    currObject[part] = value;
                }
                else {
                    currObject = currObject[part];
                }
            }
        }
        return target;
    };
    return ObjectUtils;
}());
exports.default = ObjectUtils;
