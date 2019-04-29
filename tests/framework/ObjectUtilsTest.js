"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ObjectUtils_1 = require("../../lib/utils/ObjectUtils");
describe('ObjectUtils test suite', function () {
    var source = {
        name: 'Jon',
        address: {
            number: 14,
            suburb: { name: 'mowbray', code: 7700 },
            links: [
                'http://www.test1.com',
                'http://www.test2.com',
            ]
        }
    };
    it('Test getProp() basic accessors', function () {
        expect(ObjectUtils_1.default.getProp(source, 'name')).toBe('Jon');
        expect(ObjectUtils_1.default.getProp(source, 'address.number')).toBe(14);
        expect(ObjectUtils_1.default.getProp(source, 'address.suburb.name')).toBe('mowbray');
        expect(ObjectUtils_1.default.getProp(source, 'address.links[1]')).toBe('http://www.test2.com');
        expect(ObjectUtils_1.default.getProp(source, 'address.links[2]')).toBe(null);
        expect(ObjectUtils_1.default.getProp(source, 'notThere')).toBe(null);
        expect(ObjectUtils_1.default.getProp(source, 'address.notThere')).toBe(null);
        expect(ObjectUtils_1.default.getProp(source, 'address.notThere', false)).toBe(undefined);
    });
    it('Test getProp() error condition', function () {
        expect(function () {
            ObjectUtils_1.default.getProp(source, 'address.links[invalid]');
        }).toThrow();
    });
    it('Test getProp() root array accessor', function () {
        expect(ObjectUtils_1.default.getProp(['one', 'two'], '[1]')).toBe('two');
    });
    it('Test setProp() basic access', function () {
        var target = {};
        ObjectUtils_1.default.setProp(target, 'name', 'Jon');
        ObjectUtils_1.default.setProp(target, 'address.number', 14);
        ObjectUtils_1.default.setProp(target, 'address.links[1]', 'http://www.test2.com');
        expect(target['name']).toBe('Jon');
        expect(target['address']['number']).toBe(14);
        expect(target['address']['links'][1]).toBe('http://www.test2.com');
    });
    it('Test setProp() null target', function () {
        expect(function () {
            ObjectUtils_1.default.setProp(null, 'address.links[invalid]', 'something');
        }).toThrow();
    });
});
