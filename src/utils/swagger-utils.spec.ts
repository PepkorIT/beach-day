import {SwaggerUtils} from './swagger-utils';
import {ProjectPaths} from './project-paths';
import * as path from 'path';
import * as tv4 from 'tv4';
import * as fs from 'fs';
import {SwaggerUtilsSpecData} from './swagger-utils.spec.data';

describe('SwaggerUtilsTest Tests', () => {
    var converted,
        rootPath;

    beforeEach(() => {
        try {
            converted = SwaggerUtils.parseSwaggerJSON(path.join(ProjectPaths.templates, 'swagger-test.json'));
            //console.log('converted', JSON.stringify(converted, null, 4));
            rootPath  = converted['paths']['/customerCollection/validateCustomerReferenceNumber']['post'];
            //console.log("rootPath = ", JSON.stringify(rootPath, null, 4));
        }
        catch (err) {
            console.log('ERROR');
            console.log(err);
        }
    });

    it('Test basic required update', () => {
        var parcelObj = rootPath['responses']['200']['schema']['properties']['parcels']['items']['properties']['parcel'];
        expect(parcelObj['properties']['dropLabelBarcode']['type'] instanceof Array).toBe(true);
        expect(parcelObj['properties']['dropLabelBarcode']['type'][0]).toBe('string');
        expect(parcelObj['properties']['dropLabelBarcode']['type'][1]).toBe('null');
    });

    it('Test x-isnullable update', () => {
        var schema = rootPath['responses']['200']['schema'];
        expect(schema['type'] instanceof Array).toBe(true);
        expect(schema['type'][0]).toBe('object');
        expect(schema['type'][1]).toBe('null');
    });

    it('Test non required properties when there is no required array', () => {
        expect(rootPath['responses']['200']['schema']['properties']['parcels']['type'] instanceof Array).toBe(true);
        expect(rootPath['responses']['200']['schema']['properties']['parcels']['type'][0]).toBe('array');
        expect(rootPath['responses']['200']['schema']['properties']['parcels']['type'][1]).toBe('null');
    });

    it('Test not required enum should be valid', () => {
        var data   = {
            reason: null
        };
        var schema = SwaggerUtils.recurseSwagger({
            'type'      : 'object',
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

    it('Test recurseSwagger() with circular referenced objects', () => {
        const client    = {name: 'string', age: 'string', siblings: null};
        client.siblings = client;
        const obj       = {paths: {'/path/one': {properties: {client: client}}}};
        expect(() => {
            SwaggerUtils.recurseSwagger(obj);
        }).not.toThrow();
    });

    it('Test recurseSwagger() allow strings to be numbers', () => {
        const res = SwaggerUtils.recurseSwagger(SwaggerUtilsSpecData, true);
        expect(res['paths']['/fetchStartupData']['post']['responses']['401']['schema']['properties']['fault']['type']).toBe('string');
        expect(res['paths']['/fetchStartupData']['post']['responses']['401']['schema']['properties']['message']['type']).toContain('number');
        expect(res['paths']['/fetchStartupData']['post']['responses']['401']['schema']['properties']['message']['type']).toContain('string');
        expect(res['paths']['/fetchStartupData']['post']['responses']['401']['schema']['properties']['message']['type']).not.toContain('null');
    });

    xit('Test data swaggers', () => {
        const run = (path:string) => {
            console.log('testing swagger: ' + path);
            const jsonStr = fs.readFileSync(path, 'utf8');
            const swagger = JSON.parse(jsonStr);
            SwaggerUtils.recurseSwagger(swagger, true);
        };

        run('swagger/external-supplier-api-swagger.json');
        run('swagger/mobile-api-swagger.json');
        run('swagger/pmm-api-swagger.json');
        console.log('done');
    });

});
