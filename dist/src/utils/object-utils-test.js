"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_utils_1 = require("./object-utils");
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
        expect(object_utils_1.ObjectUtils.getProp(source, 'name')).toBe('Jon');
        expect(object_utils_1.ObjectUtils.getProp(source, 'address.number')).toBe(14);
        expect(object_utils_1.ObjectUtils.getProp(source, 'address.suburb.name')).toBe('mowbray');
        expect(object_utils_1.ObjectUtils.getProp(source, 'address.links[1]')).toBe('http://www.test2.com');
        expect(object_utils_1.ObjectUtils.getProp(source, 'address.links[2]')).toBe(null);
        expect(object_utils_1.ObjectUtils.getProp(source, 'notThere')).toBe(null);
        expect(object_utils_1.ObjectUtils.getProp(source, 'address.notThere')).toBe(null);
        expect(object_utils_1.ObjectUtils.getProp(source, 'address.notThere', false)).toBe(undefined);
    });
    it('Test getProp() error condition', function () {
        expect(function () {
            object_utils_1.ObjectUtils.getProp(source, 'address.links[invalid]');
        }).toThrow();
    });
    it('Test getProp() root array accessor', function () {
        expect(object_utils_1.ObjectUtils.getProp(['one', 'two'], '[1]')).toBe('two');
    });
    it('Test setProp() basic access', function () {
        var target = {};
        object_utils_1.ObjectUtils.setProp(target, 'name', 'Jon');
        object_utils_1.ObjectUtils.setProp(target, 'address.number', 14);
        object_utils_1.ObjectUtils.setProp(target, 'address.links[1]', 'http://www.test2.com');
        expect(target['name']).toBe('Jon');
        expect(target['address']['number']).toBe(14);
        expect(target['address']['links'][1]).toBe('http://www.test2.com');
    });
    it('Test setProp() null target', function () {
        expect(function () {
            object_utils_1.ObjectUtils.setProp(null, 'address.links[invalid]', 'something');
        }).toThrow();
    });
});
//# sourceMappingURL=object-utils-test.js.map