import {console} from '../reporter/beach-day-reporter';
import ObjectUtils from './object-utils';
import * as tv4 from 'tv4';

export var TestUtils = {
    throwExpectError: function (message:string):void {
        expect(true).throwExpectError(message);
    },

    throwImplementationError: function (message:string):void {
        expect(true).throwImplementationError(message);
    },

    isValidISO8601DateFormat: function (data):boolean {
        var dateReg = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
        // Valid for null
        if (data == null) {
            return true;
        }
        // Invalid for empty string
        else if (data == '') {
            return false;
        }
        // Otherwise test against value
        else {
            return dateReg.test(data);
        }
    },
    validateSwaggerSchema   : function (data:any, swaggerObject:Object, endPoint:string, method:string, isResponse:boolean, statusCode?:number, banUnknownProperties:boolean = false):boolean {
        var valid = false;
        var schema;
        // statusCode is populated means we need to look for a response object schema
        if (isResponse) {
            schema = ObjectUtils.getProp(swaggerObject, `paths.${endPoint}.${method.toLowerCase()}.responses.${statusCode}.schema`);
        }
        // Otherwise we need to look for the body parameter
        else {
            var parameters = ObjectUtils.getProp(swaggerObject, `paths.${endPoint}.${method.toLowerCase()}.parameters`);
            // Now look for the body object
            if (parameters) {
                for (var i = 0; i < parameters.length; i++) {
                    if (parameters[i].in == 'body') {
                        schema = parameters[i].schema;
                        break;
                    }
                }
            }
        }
        if (schema == null) {
            // null schema is a test implementation error
            this.throwImplementationError(`Expected to be able to test ${isResponse ? 'response' : 'request'} schema for ${method.toUpperCase()} ${endPoint}${isResponse ? ':' + statusCode : ''} but unable to find schema object in the swagger.`);
        }
        else {
            valid = this.validateSchema(data, schema, isResponse, banUnknownProperties).valid;
        }

        return valid;
    },

    validateSchema: function (data:any, schema:tv4.JsonSchema, isResponse:boolean, banUnknownProperties:boolean) {

        tv4.addFormat('date-time', (data, schema) => {
            var valid = this.isValidISO8601DateFormat(data);
            return valid ? null : 'Expected \'' + data + '\' to be a full valid ISO-8601 including timezone.';
        });

        var result = tv4.validateMultiple(data, schema, null, banUnknownProperties);

        if (!result.valid) {
            // Invalid for a REQUEST should register an implementation error in the reporter

            // Remove the stack trace as it just clogs up the reports
            if (result.errors) result.errors.forEach((error:any) => {
                delete error.stack;
            });

            if (!isResponse) {
                console.log('Request Data:');
                console.log(JSON.stringify(data, null, 4));
                console.log('');
            }

            console.log(`${isResponse ? 'Response' : 'Request'} Schema Failure Result:`);
            console.log(JSON.stringify(result, null, 4));

            if (!isResponse) {
                this.throwImplementationError('Expected REQUEST body to match the JSON schema defined');
            }
            else {
                this.throwExpectError('Expected RESPONSE body to match the JSON schema defined');
            }
        }

        return result;
    }
};
