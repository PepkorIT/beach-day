export declare class SwaggerUtils {
    /**
     * Utility to load and parse a swagger JSON file
     * Note this method updates the swagger object by looking for schema keys of 'x-isnullable'
     * Then updating the object type to to be an array or original type and null
     * This allows you to support null schema checks using tv4 framework
     * e.g.: "type": "string" becomes "type":["string", null]
     *
     * @param swaggerJSONPath {Object} The path the the JSON file
     * @param doNullableConversions {Object} Weather or not to do the nullable conversions, defaults to true
     * @returns {*}
     */
    static parseSwaggerJSON(swaggerJSONPath: string, doNullableConversions?: boolean): any;
    static recurseSwagger(swaggerObj: any): any;
}
