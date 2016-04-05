import { JasmineAsyncEnv } from "../utils/JasmineAsyncEnv";
import { IncomingMessage } from "http";
import { ExtendingObject } from "./ExtendingObject";
export interface ICallConfigParams {
    baseURL?: string;
    testName?: string;
    endPoint?: string;
    headers?: any;
    method?: string;
    waits?: number;
    status?: number;
    beforeFuncArr?: Array<IBeforeFunc>;
    dataArr?: Array<IDataFunc | any>;
    assertFuncArr?: Array<IAssertFunc>;
    obfuscateArr?: Array<IObfuscateFunc>;
    checkRequestSchemaFunc?: ISchemaFunc;
    checkResponseSchemaFunc?: ISchemaFunc;
    checkRequestSchema?: boolean;
    checkResponseSchema?: boolean;
}
export interface IBeforeFunc {
    (env: JasmineAsyncEnv, call: CallConfig): void;
}
export interface IAssertFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body: any, res: IncomingMessage): void;
}
export interface IDataFunc {
    (env: JasmineAsyncEnv, call: CallConfig): any;
}
export interface IObfuscateFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body: any, res: IncomingMessage): void;
}
export interface ISchemaFunc {
    (env: JasmineAsyncEnv, call: CallConfig, data: any, res: IncomingMessage): boolean;
}
export declare class CallConfig extends ExtendingObject<CallConfig, ICallConfigParams> implements ICallConfigParams {
    baseURL: string;
    testName: string;
    endPoint: string;
    headers: any;
    method: string;
    waits: number;
    status: number;
    beforeFuncArr: Array<IBeforeFunc>;
    dataArr: Array<IDataFunc | any>;
    assertFuncArr: Array<IAssertFunc>;
    obfuscateArr: Array<IObfuscateFunc>;
    checkRequestSchemaFunc: ISchemaFunc;
    checkResponseSchemaFunc: ISchemaFunc;
    checkRequestSchema: boolean;
    checkResponseSchema: boolean;
    constructor(params?: ICallConfigParams);
    beforeProxy(env: JasmineAsyncEnv): void;
    getDataImpl(env: JasmineAsyncEnv): any;
    assertFuncImpl(env: JasmineAsyncEnv, body: any, res: IncomingMessage): void;
    obfuscateFuncImpl(env: JasmineAsyncEnv, body: any, res: IncomingMessage): void;
    checkSchemaImpl(env: JasmineAsyncEnv, data: any, isRequest: boolean, res: IncomingMessage): boolean;
    fullURL: string;
    extend(params: ICallConfigParams): CallConfig;
}
export declare class CallRunner {
    defaultConfig: CallConfig;
    timeout: number;
    run(call: CallConfig, env: JasmineAsyncEnv): void;
    logRequestResponse(error: any, res: any, body: any, options: any): void;
}
