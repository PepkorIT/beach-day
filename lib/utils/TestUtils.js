"use strict";
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var ObjectUtils_1 = require("./ObjectUtils");
var tv4 = require("tv4");
function throwExpectError(message) {
    expect(true).throwExpectError(message);
}
exports.throwExpectError = throwExpectError;
function throwImplementationError(message) {
    expect(true).throwImplementationError(message);
}
exports.throwImplementationError = throwImplementationError;
function isValidISO8601DateFormat(data) {
    var dateReg = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
    // Valid for null
    if (data == null) {
        return true;
    }
    else if (data == "") {
        return false;
    }
    else {
        return dateReg.test(data);
    }
}
exports.isValidISO8601DateFormat = isValidISO8601DateFormat;
function validateSwaggerSchema(data, swaggerObject, endPoint, method, statusCode) {
    var valid = false;
    var schema;
    // statusCode is populated means we need to look for a response object schema
    if (statusCode != null) {
        schema = ObjectUtils_1.default.getProp(swaggerObject, "paths." + endPoint + "." + method.toLowerCase() + ".responses." + statusCode + ".schema");
    }
    else {
        var parameters = ObjectUtils_1.default.getProp(swaggerObject, "paths." + endPoint + "." + method.toLowerCase() + ".parameters");
        // Now look for the body object
        if (parameters) {
            for (var i = 0; i < parameters.length; i++) {
                if (parameters[i].in == "body") {
                    schema = parameters[i].schema;
                    break;
                }
            }
        }
    }
    if (schema == null) {
        // null schema is a test implementation error
        throwImplementationError("Expected to be able to test schema for " + method.toUpperCase() + " " + endPoint + (statusCode != null ? ":" + statusCode : "") + " but unable to find schema object in the swagger.");
    }
    else {
        valid = validateSchema(data, schema, (statusCode == null)).valid;
    }
    return valid;
}
exports.validateSwaggerSchema = validateSwaggerSchema;
function validateSchema(data, schema, isRequest) {
    tv4.addFormat("date-time", function (data, schema) {
        var valid = isValidISO8601DateFormat(data);
        return valid ? null : "Expected '" + data + "' to be a full valid ISO-8601 including timezone.";
    });
    var result = tv4.validateMultiple(data, schema);
    if (!result.valid) {
        // Invalid for a REQUEST should register an implementation error in the reporter
        // TODO: Maybe remove this as the typings say stack is not there...
        // Remove the stack trace as it just clogs up the reports
        if (result.errors)
            result.errors.forEach(function (error) { delete error.stack; });
        BeachDayReporter_1.console.log((isRequest ? "Request" : "Response") + " Schema Failure Result:");
        BeachDayReporter_1.console.log("<hr />");
        BeachDayReporter_1.console.log(JSON.stringify(result, null, 4));
        if (isRequest) {
            throwImplementationError("Expected REQUEST body to match the JSON schema defined");
        }
        else {
            throwExpectError("Expected RESPONSE body to match the JSON schema defined");
        }
    }
    return result;
}
exports.validateSchema = validateSchema;
