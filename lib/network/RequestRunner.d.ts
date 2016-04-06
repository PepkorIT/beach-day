import { JasmineAsyncEnv } from "../utils/JasmineAsyncEnv";
import { CallConfig } from "./CallConfig";
export declare class RequestRunner {
    static globalDefaults: CallConfig;
    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    static run(call: CallConfig, env: JasmineAsyncEnv): void;
    /**
     * Pretty logging for the reporter of the request and repsonse
     */
    static logRequestResponse(error: any, res: any, body: any, options: any): void;
}
