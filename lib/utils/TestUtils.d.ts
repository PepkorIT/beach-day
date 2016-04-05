export declare var TestUtils: {
    throwExpectError: (message: string) => void;
    throwImplementationError: (message: string) => void;
    isValidISO8601DateFormat: (data: any) => boolean;
    validateSwaggerSchema: (data: any, swaggerObject: Object, endPoint: string, method: string, statusCode?: number) => boolean;
    validateSchema: (data: any, schema: tv4.JsonSchema, isRequest: boolean) => tv4.MultiResult;
};
