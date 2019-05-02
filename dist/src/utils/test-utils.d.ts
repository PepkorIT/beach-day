import * as tv4 from 'tv4';
export declare var TestUtils: {
    throwExpectError: (message: string) => void;
    throwImplementationError: (message: string) => void;
    isValidISO8601DateFormat: (data: any) => boolean;
    validateSwaggerSchema: (data: any, swaggerObject: Object, endPoint: string, method: string, isResponse: boolean, statusCode?: number, banUnknownProperties?: boolean) => boolean;
    validateSchema: (data: any, schema: tv4.JsonSchema, isResponse: boolean, banUnknownProperties: boolean) => tv4.MultiResult;
};
