export declare class JasmineAsyncEnv {
    id: number;
    currentBody: any;
    failed: boolean;
    done: () => void;
    constructor();
    wrap(cb: (env: JasmineAsyncEnv) => void): (done) => void;
    setProp(destinationName: string, sourceName: string): any;
    checkProps(...propertyNames: Array<string>): void;
    checkProp(sourceName: string): any;
}
