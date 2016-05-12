export interface IJasmineAsyncEnv {
    id: number;
    currentBody: any;
    failed: boolean;
    done: () => void;
    wrap(cb: (env: JasmineAsyncEnv) => void): (done) => void;
    setProp(destinationName: string, sourceName: string): any;
    checkProps(...propertyNames: Array<string>): void;
    checkProp(sourceName: string): any;
}
export declare class JasmineAsyncEnv implements IJasmineAsyncEnv {
    linkedEnv: JasmineAsyncEnv;
    id: number;
    currentBody: any;
    failed: boolean;
    done: () => void;
    /**
     * @class
     * @name JasmineAsyncEnv
     * @description
     * Environment class that links a number tests in a sequence with the wrap() method.
     *
     * @param linkedEnv {JasmineAsyncEnv} Optional. Linked JasmineAsyncEnv to base the original this one on.
     */
    constructor(linkedEnv?: JasmineAsyncEnv);
    /**
     * Wrapper for a test method. The cb will only be executed if the all the previous tests have passed.
     * @memberof JasmineAsyncEnv
     *
     * @param cb {Function} The test method to wrap
     * @returns {Function} A function to pass to the jasmine it() method.
     */
    wrap(cb: (env: JasmineAsyncEnv) => void): (done) => void;
    /**
     * Utility method, used to set a property from this.currentBody onto this object.
     * Property identifiers for source and destination are passed using string values that can contain dots and array accessors.
     * This means we can "try" access properties that would otherwise cause runtime errors without a lot of if statements.
     * If the sourceName is not found on this.currentBody no property is set
     *
     * @memberof JasmineAsyncEnv
     *
     * @param destinationName {String} The identifier for the destination property on this object
     * @param sourceName {String} The identifier for the source property on this.currentBody
     * @returns {any} The value from this.currentBody[sourceName] if found
     */
    setProp(destinationName: string, sourceName: string): any;
    /**
     * Utility method, used to check if an array of properties exist on this.currentBody
     * @see JasmineAsyncEnv#checkProp
     *
     * @memberof JasmineAsyncEnv
     *
     * @param properties {Array} List of properties to check
     */
    checkProps(...properties: Array<string>): void;
    /**
     * Utility method, used to check if a propery exists on this.currentBody
     * Property identifier sourceName is passed using string values that can contain dots and array accessors.
     * This means we can "try" access properties that would otherwise cause runtime errors without a lot of if statements.
     *
     * @memberof JasmineAsyncEnv
     *
     * @param sourceName {String} The identifier for the source property on this.currentBody
     * @returns {any} The value from this.currentBody[sourceName] if found
     */
    checkProp(sourceName: string): any;
}
