import {TestUtils} from './test-utils';

describe('TestUtils test', () => {

    it('Test expect()', () => {
        const spy = spyOn(TestUtils, 'throwExpectError');
        let val   = '2';
        TestUtils.expect(val === '1', 'Expected something');
        expect(spy).toHaveBeenCalledWith('Expected something');

        TestUtils.expect(() => val === '1', 'Expected something else');
        expect(spy).toHaveBeenCalledWith('Expected something else');
    });
});
