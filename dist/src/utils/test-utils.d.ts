import * as tv4 from 'tv4';
export declare class TestUtils {
    static expect(testFunction: (() => boolean) | boolean, errorMessage: string): void;
    static throwExpectError(message: string): void;
    static throwImplementationError(message: string): void;
    static isValidISO8601DateFormat(data: any): boolean;
    static validateSwaggerSchema(data: any, swaggerObject: Object, endPoint: string, method: string, isResponse: boolean, statusCode?: number, banUnknownProperties?: boolean): boolean;
    static validateSchema(data: any, schema: tv4.JsonSchema, isResponse: boolean, banUnknownProperties: boolean): tv4.MultiResult;
}
