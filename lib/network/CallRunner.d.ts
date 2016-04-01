import { JasmineAsyncEnv } from "../utils/JasmineAsyncEnv";
import { IncomingMessage } from "http";
import { ExtendingObject } from "./ExtendingObject";
export interface ICallConfigParams {
    baseURL?: string;
    endPoint?: string;
    headers?: any;
    method?: string;
    waits?: number;
    status?: number;
    dataArr?: Array<IDataFunc | any>;
    assertFuncArr?: Array<IAssertFunc>;
    obfuscateArr?: Array<IObfuscateFunc>;
    checkSchemaFunc?: (call: CallConfig, data: any, isRequest: boolean) => boolean;
    checkRequestSchema?: boolean;
    checkSchema?: boolean;
}
export interface IAssertFunc {
    (env: JasmineAsyncEnv, res: IncomingMessage, body?: any): void;
}
export interface IDataFunc {
    (env: JasmineAsyncEnv): any;
}
export interface IObfuscateFunc {
    (call: CallConfig, env: JasmineAsyncEnv, res?: IncomingMessage, body?: any): void;
}
export declare class CallConfig extends ExtendingObject<CallConfig, ICallConfigParams> implements ICallConfigParams {
    baseURL: string;
    endPoint: string;
    headers: any;
    method: string;
    waits: number;
    status: number;
    dataArr: Array<(env: JasmineAsyncEnv) => any | any>;
    assertFuncArr: Array<IAssertFunc>;
    obfuscateArr: Array<IObfuscateFunc>;
    checkSchemaFunc: (call: CallConfig, data: any, isRequest: boolean) => boolean;
    checkRequestSchema: boolean;
    checkSchema: boolean;
    getDataImpl(env: JasmineAsyncEnv): any;
    assertFuncImpl(env: JasmineAsyncEnv, res: IncomingMessage, body?: any): void;
    obfuscateFuncImpl(env: JasmineAsyncEnv, res: IncomingMessage, body?: any): void;
    checkSchemaImpl(data: any, isRequest: boolean): boolean;
    fullURL: string;
    extend(params: ICallConfigParams): CallConfig;
}
export declare class CallRunner {
    defaultConfig: CallConfig;
    timeout: number;
    run(call: CallConfig, env: JasmineAsyncEnv): void;
    logRequestResponse(error: any, res: any, body: any): void;
}
