"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var test_utils_1 = require("./test-utils");
describe('TestUtils test', function () {
    it('Test expect()', function () {
        var spy = spyOn(test_utils_1.TestUtils, 'throwExpectError');
        var val = '2';
        test_utils_1.TestUtils.expect(val === '1', 'Expected something');
        expect(spy).toHaveBeenCalledWith('Expected something');
        test_utils_1.TestUtils.expect(function () { return val === '1'; }, 'Expected something else');
        expect(spy).toHaveBeenCalledWith('Expected something else');
    });
});
//# sourceMappingURL=test-utils.spec.js.map