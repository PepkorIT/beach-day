import { JasmineAsyncEnv } from "../utils/JasmineAsyncEnv";
import { CallConfig } from "./CallConfig";
import * as request from "request";
export declare class RequestRunner {
    static request: request.RequestAPI<request.Request, request.CoreOptions, request.UriOptions | request.UrlOptions>;
    static globalDefaults: CallConfig;
    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    static run(call: CallConfig, env: JasmineAsyncEnv): void;
    static hasHeader(headers: any, name: string, value?: string): boolean;
    /**
     * Pretty logging for the reporter of the request and repsonse
     */
    static logRequestResponse(error: any, res: any, parsedResponseBody: any, options: any, isError: boolean): void;
}
