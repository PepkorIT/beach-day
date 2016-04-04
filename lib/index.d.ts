declare namespace jasmine {
    interface Matchers {
        toBePassing(): boolean;
        throwExpectError(message:string): boolean;
        throwImplementationError(message:string): boolean;
        statusCodeToBe(statusCode:number): boolean;
    }
}
declare module "utils/ObjectUtils" {
    export default class ObjectUtils {
        static getProp(source: Object | Array<any>, propertyAccessor: string): any;
    }
}
declare module "utils/JasmineAsyncEnv" {
    export class JasmineAsyncEnv {
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
}
declare module "reporter/ReportGenerator" {
    import { IDataStore, ReporterConfig } from "reporter/BeachDayReporter";
    export function generate(viewModel?: IDataStore, config?: ReporterConfig): void;
}
declare module "reporter/BeachDayReporter" {
    import { JasmineAsyncEnv } from "utils/JasmineAsyncEnv";
    export interface IDataStore extends IViewData {
        suiteInfo: ISuiteInfo;
        id: string;
        maxTestTime?: string;
    }
    export interface ISuiteInfo {
        totalSpecsDefined: number;
    }
    export interface ICustomSuite extends jasmine.Suite, IViewData {
    }
    export interface ICustomSpec extends jasmine.Spec, IViewData {
        beachStatus: string;
    }
    export interface IViewData {
        isSpec: boolean;
        level: number;
        parent?: ICustomSuite;
        viewChildren?: Array<IViewData>;
        startTime?: Date;
        startTimeFormatted?: string;
        endTime?: Date;
        endTimeFormatted?: string;
        durationMilli?: number;
        durationFormatted?: string;
        durationWarning?: boolean;
        failedCount?: number;
        skippedCount?: number;
        notRunCount?: number;
        passedCount?: number;
        implementationErrorCount?: number;
        allPassed?: boolean;
        colorClass?: Function;
        iconClass?: Function;
        debugData?: Array<any>;
    }
    export interface IReporterConfig {
        reportName?: string;
        reportDir?: string;
        viewDataPath?: string;
        headerTemplatePath?: string;
        indexTemplatePath?: string;
        suiteTemplatePath?: string;
        stylesPath?: string;
        titleTemplatePath?: string;
        summaryTemplatePath?: string;
        latestTemplatePath?: string;
        logToConsole?: boolean;
        includeAllConsoleLogs?: boolean;
        maxTestTime?: number;
    }
    export class ReporterConfig implements IReporterConfig {
        reportName: string;
        reportDir: string;
        viewDataPath: string;
        headerTemplatePath: string;
        indexTemplatePath: string;
        suiteTemplatePath: string;
        stylesPath: string;
        titleTemplatePath: string;
        summaryTemplatePath: string;
        latestTemplatePath: string;
        logToConsole: boolean;
        includeAllConsoleLogs: boolean;
        maxTestTime: number;
        constructor(config?: IReporterConfig);
        viewDataDir: string;
        reportDynamicName: string;
        reportDynamicPath: string;
        latestReportName: string;
        reportStaticPath: string;
    }
    export function setCurrentEnvironment(env: JasmineAsyncEnv): void;
    export function clearCurrentEnvironment(): void;
    export class ReporterConsole {
        logToConsole: boolean;
        private _currentSpec;
        private cache;
        log: (...args: any[]) => void;
        info: (...args: any[]) => void;
        debug: (...args: any[]) => void;
        warn: (...args: any[]) => void;
        error: (...args: any[]) => void;
        currentSpec: ICustomSpec;
        private store(args, logger);
    }
    export var console: ReporterConsole;
    export class BeachDayReporter {
        private dataStore;
        private currentSuite;
        private _currentEnvironment;
        private currentSpec;
        private config;
        private static STATUS_PASSED;
        private static STATUS_FAILED;
        private static STATUS_SKIPPED;
        private static STATUS_NOT_RUN;
        constructor(config?: IReporterConfig);
        currentEnvironment: JasmineAsyncEnv;
        private wrap(cb);
        jasmineStarted(suiteInfo: ISuiteInfo): void;
        suiteStarted(result: ICustomSuite): void;
        suiteDone(result: ICustomSuite): void;
        specStarted(result: ICustomSpec): void;
        specDone(result: ICustomSpec): void;
        jasmineDone(result: any): void;
        private recurseSuitesPopulateViewData(data, level?);
        private prettyProps(data);
        private formatDuration(durationMilli);
        private initIViewData(value);
        private incrementIViewData(source, dest);
        private getDate(date1, date2, earliest);
        private stringLogs(data);
    }
}
declare module "BasicConfig" {
    export function getBasicConfig(reportName: string, configFile?: string, timeout?: number, autoExecute?: boolean): any;
}
declare module "utils/RandomUtils" {
    export var RandomUtils: {
        _names: string[];
        _companies: string[];
        _cnt: number;
        _alphaNumeric: string;
        array: (values: any) => any;
        number: (min: any, max: any, round: any) => any;
        fullName: () => any;
        firstName: () => any;
        lastName: () => any;
        companyName: () => any;
        id: () => any;
        stringHash: (length: any) => string;
        numHash: (length: any) => string;
        dateInPast: (resetTime: any) => Date;
        dateInFuture: (resetTime: any) => Date;
        dateAge: (minAge: any, resetTime: any) => Date;
    };
}
declare module "utils/SwaggerUtils" {
    export class SwaggerUtils {
        /**
         * Utility to load and parse a swagger JSON file
         * Note this method updates the swagger object by looking for schema keys of 'x-isnullable'
         * Then updating the object type to to be an array or original type and null
         * This allows you to support null schema checks using tv4 framework
         * e.g.: "type": "string" becomes "type":["string", null]
         *
         * @param swaggerJSONPath {Object} The path the the JSON file
         * @param doNullableConversions {Object} Weather or not to do the nullable conversions, defaults to true
         * @returns {*}
         */
        static parseSwaggerJSON(swaggerJSONPath: string, doNullableConversions?: boolean): any;
    }
}
declare module "network/ExtendingObject" {
    export class ExtendingObject<T, I> {
        constructor(params?: I);
        extend(instance: T, params: I): T;
        extender: (objectValue: any, sourceValue: any, key?: string, object?: any, source?: any) => any;
    }
}
declare module "utils/TestUtils" {
    export function throwExpectError(message: string): void;
    export function throwImplementationError(message: string): void;
    export function isValidISO8601DateFormat(data: any): boolean;
    export function validateSwaggerSchema(data: any, swaggerObject: Object, endPoint: string, method: string, statusCode?: number): boolean;
    export function validateSchema(data: any, schema: tv4.JsonSchema, isRequest: boolean): tv4.MultiResult;
}
declare module "network/CallRunner" {
    import { JasmineAsyncEnv } from "utils/JasmineAsyncEnv";
    import { IncomingMessage } from "http";
    import { ExtendingObject } from "network/ExtendingObject";
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
        checkRequestSchemaFunc?: (call: CallConfig, data: any) => boolean;
        checkResponseSchemaFunc?: (call: CallConfig, data: any) => boolean;
        checkRequestSchema?: boolean;
        checkResponseSchema?: boolean;
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
    export class CallConfig extends ExtendingObject<CallConfig, ICallConfigParams> implements ICallConfigParams {
        baseURL: string;
        endPoint: string;
        headers: any;
        method: string;
        waits: number;
        status: number;
        dataArr: Array<(env: JasmineAsyncEnv) => any | any>;
        assertFuncArr: Array<IAssertFunc>;
        obfuscateArr: Array<IObfuscateFunc>;
        checkRequestSchemaFunc: (call: CallConfig, data: any) => boolean;
        checkResponseSchemaFunc: (call: CallConfig, data: any) => boolean;
        checkRequestSchema: boolean;
        checkResponseSchema: boolean;
        getDataImpl(env: JasmineAsyncEnv): any;
        assertFuncImpl(env: JasmineAsyncEnv, res: IncomingMessage, body?: any): void;
        obfuscateFuncImpl(env: JasmineAsyncEnv, res: IncomingMessage, body?: any): void;
        checkSchemaImpl(data: any, isRequest: boolean): boolean;
        fullURL: string;
        extend(params: ICallConfigParams): CallConfig;
    }
    export class CallRunner {
        defaultConfig: CallConfig;
        timeout: number;
        run(call: CallConfig, env: JasmineAsyncEnv): void;
        logRequestResponse(error: any, res: any, body: any): void;
    }
}
declare module "index" {
    export * from "utils/JasmineAsyncEnv";
    export * from "reporter/BeachDayReporter";
    export * from "utils/RandomUtils";
    export * from "utils/SwaggerUtils";
    export * from "network/CallRunner";
}
declare module "reporter/TestReport" {
}
declare module "utils/Matchers" {
}
