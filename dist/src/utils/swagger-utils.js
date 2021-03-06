"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var loopProcess = '__loop__process__';
var loopObject = function (loopObj, callback) {
    var runIteration = function (currObject) {
        // Run through the entire object and update the type of all schemas to include null if x-isnullable is set to true
        for (var propName in currObject) {
            var value = currObject[propName];
            if (typeof value == 'object' && value != null && value[loopProcess] == null) {
                value[loopProcess] = 'done';
                runIteration(value);
            }
            callback(propName, currObject, value);
        }
        return currObject;
    };
    var result = runIteration(loopObj);
    var cleanIteration = function (currObject) {
        // Run through the entire object and update the type of all schemas to include null if x-isnullable is set to true
        for (var propName in currObject) {
            var value = currObject[propName];
            if (typeof value == 'object' && value != null && value[loopProcess] != null) {
                delete value[loopProcess];
                cleanIteration(value);
            }
        }
        return currObject;
    };
    cleanIteration(result);
    return result;
};
var convertXIsNullable = function (propName, currObject, value) {
    // Shift this property
    if (propName == 'x-isnullable' && value === true && currObject.hasOwnProperty('type')) {
        currObject.type = [currObject.type, 'null'];
    }
    return value;
};
var convertNullableBasedOnRequired = function (sourcePropName, currObject, value) {
    // Update the non required properties to be nullable
    if (sourcePropName == 'properties') {
        // First create a hash of required props
        var requiredHash = {};
        // Get the required props or an empty array if not populated to generate the hash
        var required = currObject['required'] || [];
        for (var i = 0; i < required.length; i++) {
            requiredHash[required[i]] = true;
        }
        // Now run through all the properties of the
        // current object and make non required nullable
        var properties = value;
        for (var propName in properties) {
            if (propName === loopProcess)
                continue;
            var type = properties[propName].type;
            // Determine if the property already has null
            var hasNull = false;
            if (type instanceof Array) {
                for (var i = 0; i < type.length; i++) {
                    if (type[i] === 'null') {
                        hasNull = true;
                        break;
                    }
                }
            }
            // If is required add null into the
            if (requiredHash[propName] == undefined) {
                // If already an array, look for null
                if (type instanceof Array) {
                    if (!hasNull)
                        type.push('null');
                }
                // Otherwise just convert to array and add null
                else {
                    properties[propName].type = [properties[propName].type, 'null'];
                }
                // for the enum we also have to add an option of null to the list
                if (properties[propName].hasOwnProperty('enum')) {
                    var enumList = properties[propName]['enum'];
                    if (enumList.length > 0 && enumList[enumList.length - 1] != null) {
                        properties[propName]['enum'].push(null);
                    }
                }
            }
            // If not required then make sure there is no null in the type definition
            else if (type instanceof Array && hasNull) {
                for (var i = 0; i < type.length; i++) {
                    if (type[i] == 'null') {
                        type.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    return value;
};
var convertStringsToAllowNumbers = function (propName, currObject, value) {
    // If there is a type & there is no enums which ties strings explicitly to the data type
    if (currObject.hasOwnProperty('type') && !currObject.hasOwnProperty('enum')) {
        if (currObject.type instanceof Array) {
            var containsNumber_1 = false;
            var containsString_1 = false;
            currObject.type.forEach(function (type) {
                if (type === 'string') {
                    containsString_1 = true;
                }
                else if (type === 'number') {
                    containsNumber_1 = true;
                }
            });
            if (containsString_1 && !containsNumber_1) {
                currObject.type.push('number');
            }
        }
        else if (typeof currObject.type === 'string' && currObject.type === 'string') {
            currObject.type = ['number', 'string'];
        }
    }
    return value;
};
var SwaggerUtils = /** @class */ (function () {
    function SwaggerUtils() {
    }
    /**
     *
     * Utility to load and parse a swagger JSON file
     * Note this method updates the swagger object by looking for schema keys of 'x-isnullable'
     * Then updating the object type to to be an array or original type and null
     * This allows you to support null schema checks using tv4 framework
     * e.g.: "type": "string" becomes "type":["string", null]
     *
     * @param swaggerJSONPath {Object} The path the the JSON file
     * @param doNullableConversions {Object} Weather or not to do the nullable conversions, defaults to true
     * @param allowStringsToBeNumbers {Boolean} If true all string values will permit numbers too, defautls defaults to false
     * @returns {*}
     */
    SwaggerUtils.parseSwaggerJSON = function (swaggerJSONPath, doNullableConversions, allowStringsToBeNumbers) {
        if (doNullableConversions === void 0) { doNullableConversions = true; }
        if (allowStringsToBeNumbers === void 0) { allowStringsToBeNumbers = false; }
        // Load the swagger file
        var swaggerJSONStr = fs.readFileSync(swaggerJSONPath, { encoding: 'utf-8' });
        // Parse file from JSON
        var swaggerObj = JSON.parse(swaggerJSONStr);
        // Process and return
        if (doNullableConversions) {
            swaggerObj = loopObject(swaggerObj, convertXIsNullable);
            swaggerObj = loopObject(swaggerObj, convertNullableBasedOnRequired);
        }
        if (allowStringsToBeNumbers) {
            swaggerObj = loopObject(swaggerObj, convertStringsToAllowNumbers);
        }
        return swaggerObj;
    };
    SwaggerUtils.recurseSwagger = function (swaggerObj, allowStringsToBeNumbers) {
        if (allowStringsToBeNumbers === void 0) { allowStringsToBeNumbers = false; }
        // Process and return
        swaggerObj = loopObject(swaggerObj, convertXIsNullable);
        swaggerObj = loopObject(swaggerObj, convertNullableBasedOnRequired);
        if (allowStringsToBeNumbers) {
            swaggerObj = loopObject(swaggerObj, convertStringsToAllowNumbers);
        }
        return swaggerObj;
    };
    return SwaggerUtils;
}());
exports.SwaggerUtils = SwaggerUtils;
//# sourceMappingURL=swagger-utils.js.map