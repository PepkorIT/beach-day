export declare function throwExpectError(message: string): void;
export declare function throwImplementationError(message: string): void;
export declare function isValidISO8601DateFormat(data: any): boolean;
export declare function validateSwaggerSchema(data: any, swaggerObject: Object, endPoint: string, method: string, statusCode?: number): boolean;
export declare function validateSchema(data: any, schema: tv4.JsonSchema, isRequest: boolean): tv4.MultiResult;
