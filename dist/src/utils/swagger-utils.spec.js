"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var swagger_utils_1 = require("./swagger-utils");
var project_paths_1 = require("./project-paths");
var path = require("path");
var tv4 = require("tv4");
var swagger_utils_spec_data_1 = require("./swagger-utils.spec.data");
describe('SwaggerUtilsTest Tests', function () {
    var converted, rootPath;
    beforeEach(function () {
        try {
            converted = swagger_utils_1.SwaggerUtils.parseSwaggerJSON(path.join(project_paths_1.ProjectPaths.templates, 'swagger-test.json'));
            //console.log('converted', JSON.stringify(converted, null, 4));
            rootPath = converted['paths']['/customerCollection/validateCustomerReferenceNumber']['post'];
            //console.log("rootPath = ", JSON.stringify(rootPath, null, 4));
        }
        catch (err) {
            console.log('ERROR');
            console.log(err);
        }
    });
    it('Test basic required update', function () {
        var parcelObj = rootPath['responses']['200']['schema']['properties']['parcels']['items']['properties']['parcel'];
        expect(parcelObj['properties']['dropLabelBarcode']['type'] instanceof Array).toBe(true);
        expect(parcelObj['properties']['dropLabelBarcode']['type'][0]).toBe('string');
        expect(parcelObj['properties']['dropLabelBarcode']['type'][1]).toBe('null');
    });
    it('Test x-isnullable update', function () {
        var schema = rootPath['responses']['200']['schema'];
        expect(schema['type'] instanceof Array).toBe(true);
        expect(schema['type'][0]).toBe('object');
        expect(schema['type'][1]).toBe('null');
    });
    it('Test non required properties when there is no required array', function () {
        expect(rootPath['responses']['200']['schema']['properties']['parcels']['type'] instanceof Array).toBe(true);
        expect(rootPath['responses']['200']['schema']['properties']['parcels']['type'][0]).toBe('array');
        expect(rootPath['responses']['200']['schema']['properties']['parcels']['type'][1]).toBe('null');
    });
    it('Test not required enum should be valid', function () {
        var data = {
            reason: null
        };
        var schema = swagger_utils_1.SwaggerUtils.recurseSwagger({
            'type': 'object',
            'properties': {
                'reason': {
                    'type': 'string',
                    'enum': [
                        'WRONG_NODE',
                        'NOT_YET_DELIVERED',
                        'NOT_YET_DELIVERED_WRONG_NODE'
                    ]
                }
            }
        });
        //console.log("schema: ", JSON.stringify(schema, null, 4));
        expect(schema.properties.reason.type[0]).toBe('string');
        expect(schema.properties.reason.type[1]).toBe('null');
        expect(schema.properties.reason.enum[3]).toBe(null);
        var result = tv4.validateMultiple(data, schema, null, true);
        expect(result.valid).toBe(true);
    });
    it('Test recurseSwagger() with circular referenced objects', function () {
        var client = { name: 'string', age: 'string', siblings: null };
        client.siblings = client;
        var obj = { paths: { '/path/one': { properties: { client: client } } } };
        expect(function () {
            swagger_utils_1.SwaggerUtils.recurseSwagger(obj);
        }).not.toThrow();
    });
    it('Test recurseSwagger() allow strings to be numbers', function () {
        var res = swagger_utils_1.SwaggerUtils.recurseSwagger(swagger_utils_spec_data_1.SwaggerUtilsSpecData, true);
        expect(res['paths']['/fetchStartupData']['post']['responses']['401']['schema']['properties']['fault']['type']).toBe('string');
        expect(res['paths']['/fetchStartupData']['post']['responses']['401']['schema']['properties']['message']['type']).toContain('number');
        expect(res['paths']['/fetchStartupData']['post']['responses']['401']['schema']['properties']['message']['type']).toContain('string');
        expect(res['paths']['/fetchStartupData']['post']['responses']['401']['schema']['properties']['message']['type']).not.toContain('null');
        console.log(JSON.stringify(res, null, 4));
    });
});
//# sourceMappingURL=swagger-utils.spec.js.map