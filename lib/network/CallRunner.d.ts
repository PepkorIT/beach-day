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
    checkRequestSchemaFunc?: ISchemaFunc;
    checkResponseSchemaFunc?: ISchemaFunc;
    checkRequestSchema?: boolean;
    checkResponseSchema?: boolean;
}
export interface IAssertFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body?: any): void;
    (env: JasmineAsyncEnv, call: CallConfig): void;
    (env: JasmineAsyncEnv): void;
}
export interface IDataFunc {
    (env: JasmineAsyncEnv, call: CallConfig): any;
    (env: JasmineAsyncEnv): any;
}
export interface IObfuscateFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body?: any): void;
    (env: JasmineAsyncEnv, call: CallConfig): void;
    (env: JasmineAsyncEnv): void;
}
export interface ISchemaFunc {
    (env: JasmineAsyncEnv, call: CallConfig, data: any): boolean;
    (env: JasmineAsyncEnv, call: CallConfig): boolean;
}
export declare class CallConfig extends ExtendingObject<CallConfig, ICallConfigParams> implements ICallConfigParams {
    baseURL: string;
    endPoint: string;
    headers: any;
    method: string;
    waits: number;
    status: number;
    dataArr: Array<IDataFunc | any>;
    assertFuncArr: Array<IAssertFunc>;
    obfuscateArr: Array<IObfuscateFunc>;
    checkRequestSchemaFunc: ISchemaFunc;
    checkResponseSchemaFunc: ISchemaFunc;
    checkRequestSchema: boolean;
    checkResponseSchema: boolean;
    getDataImpl(env: JasmineAsyncEnv): any;
    assertFuncImpl(env: JasmineAsyncEnv, res: IncomingMessage, body?: any): void;
    obfuscateFuncImpl(env: JasmineAsyncEnv, res: IncomingMessage, body?: any): void;
    checkSchemaImpl(env: JasmineAsyncEnv, data: any, isRequest: boolean): boolean;
    fullURL: string;
    extend(params: ICallConfigParams): CallConfig;
}
export declare class CallRunner {
    defaultConfig: CallConfig;
    timeout: number;
    run(call: CallConfig, env: JasmineAsyncEnv): void;
    logRequestResponse(error: any, res: any, body: any): void;
}
