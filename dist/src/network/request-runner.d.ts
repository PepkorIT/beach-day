import { JasmineAsyncEnv } from '../utils/jasmine-async-env';
import { CallConfig } from './call-config';
import { IRequestResponse } from './i-request-response';
import * as request from 'request';
export interface PollCompleteFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body: any, res: IRequestResponse): {
        complete: boolean;
        nextPollDelay: number;
        failureMessage: string;
    };
}
export declare class RequestRunner {
    static request: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;
    static globalDefaults: CallConfig;
    static HEADER_CONTENT_TYPE: string;
    static JSON_C_TYPE: string;
    static FORM_C_TYPE: string;
    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    static run(call: CallConfig, env: JasmineAsyncEnv): void;
    static runPoll(call: CallConfig, env: JasmineAsyncEnv, pollComplete: PollCompleteFunc, maximumRunTime: number): void;
    static hasHeader(headers: any, name: string, value?: string): boolean;
    /**
     * Pretty logging for the reporter of the request and response
     */
    static logRequestResponse(call: CallConfig, env: JasmineAsyncEnv, error: any, res: IRequestResponse, parsedResponseBody: any, options: any, isError: boolean, parsePassed: boolean): void;
}
