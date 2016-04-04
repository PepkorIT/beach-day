import {console} from "../reporter/BeachDayReporter";
import ObjectUtils from "./ObjectUtils";
import * as tv4 from "tv4";

export function throwExpectError(message:string):void {
    expect(true).throwExpectError(message)
}
export function throwImplementationError(message:string):void {
    expect(true).throwImplementationError(message)
}

export function isValidISO8601DateFormat(data):boolean {
    var dateReg = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
    // Valid for null
    if (data == null){
        return true;
    }
    // Invalid for empty string
    else if (data == ""){
        return false;
    }
    // Otherwise test against value
    else{
        return dateReg.test(data);
    }
}

export function validateSwaggerSchema(data:any, swaggerObject:Object, endPoint:string, method:string, statusCode?:number):boolean {
    var valid = false;
    var schema;
    // statusCode is populated means we need to look for a response object schema
    if (statusCode != null){
        schema = ObjectUtils.getProp(swaggerObject, `paths.${endPoint}.${method.toLowerCase()}.responses.${statusCode}.schema`);
    }
    // Otherwise we need to look for the body parameter
    else {
        var parameters = ObjectUtils.getProp(swaggerObject, `paths.${endPoint}.${method.toLowerCase()}.parameters`);
        // Now look for the body object
        if (parameters){
            for (var i = 0; i < parameters.length; i++) {
                if (parameters[i].in == "body"){
                    schema = parameters[i].schema;
                    break;
                }
            }
        }
    }
    if (schema == null){
        // null schema is a test implementation error
        throwImplementationError(`Expected to be able to test schema for ${method.toUpperCase()} ${endPoint}${statusCode != null ? ":" + statusCode : ""} but unable to find schema object in the swagger.`);
    }
    else{
        var result = validateSchema(data, schema, statusCode);
        if (!result.valid) {
            if (statusCode == null) {
                throwImplementationError("Expected REQUEST body to match the JSON schema defined");
            }
            else {
                throwExpectError("Expected response body to match the JSON schema defined");
            }
        }
    }

    return valid;
}

export function validateSchema(data:any, schema:tv4.JsonSchema, statusCode?:number) {

    tv4.addFormat("date-time", function (data, schema) {
        var valid = isValidISO8601DateFormat(data);
        return valid ? null : "Expected '" + data + "' to be a full valid ISO-8601 including timezone.";
    });

    var result  = tv4.validateMultiple(data, schema);
    if (!result.valid) {
        // Invalid for a REQUEST should register an implementation error in the reporter


        // TODO: Maybe remove this as the typings say stack is not there...
        // Remove the stack trace as it just clogs up the reports
        if (result.errors) result.errors.forEach((error:any) => { delete error.stack; });
        console.log(`${statusCode == null ? "Request" : "Response"} Schema Failure Result:`);
        console.log("<hr />");
        console.log(JSON.stringify(result, null, 4));
    }

    return result;
}