export declare class JasmineAsyncEnv {
    linkedEnv: JasmineAsyncEnv;
    id: number;
    currentBody: any;
    failed: boolean;
    done: () => void;
    constructor(linkedEnv?: JasmineAsyncEnv);
    wrap(cb: (env: JasmineAsyncEnv) => void): (done) => void;
    setProp(destinationName: string, sourceName: string): any;
    checkProps(...propertyNames: Array<string>): void;
    checkProp(sourceName: string): any;
    /**
     * Makes sure the supplied property doesn't exist on the currentBody
     * @param propertyName
     * @returns Returns the value found on currentBody using the property name
     */
    checkPropDoesntExist(propertyName: string): any;
}
