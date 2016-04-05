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
    constructor(linkedEnv?: JasmineAsyncEnv);
    wrap(cb: (env: JasmineAsyncEnv) => void): (done) => void;
    setProp(destinationName: string, sourceName: string): any;
    checkProps(...propertyNames: Array<string>): void;
    checkProp(sourceName: string): any;
}
