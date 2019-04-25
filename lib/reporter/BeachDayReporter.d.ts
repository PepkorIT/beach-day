/// <reference types="jasmine" />
import { JasmineAsyncEnv } from "../utils/JasmineAsyncEnv";
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
    overrideMaxTestTime: number;
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
export declare class ReporterConfig implements IReporterConfig {
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
    readonly viewDataDir: string;
    readonly reportDynamicName: string;
    readonly reportDynamicPath: string;
    readonly latestReportName: string;
    readonly reportStaticPath: string;
}
export declare var consoleOrig: Console;
export declare class ReporterConsole {
    logToConsole: boolean;
    private _currentSpec;
    private cache;
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    currentSpec: ICustomSpec;
    private store;
}
export declare var console: ReporterConsole;
export declare var ReporterAPI: {
    /**
     * Overrides the default max test time for the reporter for a specific test
     * Note: this can only be called inside the execution block of a test
     *
     * @param value {number} The max test time to used, milliseconds
     */
    overrideSpecMaxTestTime: (value: number) => void;
    /**
     * Can be used used to ensure async tasks don't run after a test timeout or failure
     * @returns {string} The current spec's id
     */
    getCurrentSpecId: () => string;
    /**
     * Used by the JasmineAsyncEnv to set a reference to itself on the reporter
     * @param env {JasmineAsyncEnv}
     */
    setCurrentEnvironment: (env: JasmineAsyncEnv) => void;
    /**
     * Used to retrieve the reporters config
     * @returns {ReporterConfig}
     */
    getReporterConfig: () => ReporterConfig;
};
export declare class BeachDayReporter {
    config: ReporterConfig;
    private dataStore;
    private currentSuite;
    private _currentEnvironment;
    private currentSpec;
    private static STATUS_PASSED;
    private static STATUS_FAILED;
    private static STATUS_SKIPPED;
    private static STATUS_DISABLED;
    private static STATUS_NOT_RUN;
    constructor(config?: IReporterConfig);
    currentEnvironment: JasmineAsyncEnv;
    readonly currentSpecId: string;
    overrideSpecMaxTestTime(value: number): void;
    private wrap;
    jasmineStarted(suiteInfo: ISuiteInfo): void;
    suiteStarted(result: ICustomSuite): void;
    suiteDone(result: ICustomSuite): void;
    specStarted(result: ICustomSpec): void;
    specDone(result: ICustomSpec): void;
    jasmineDone(result: any): void;
    private recurseSuitesPopulateViewData;
    private prettyProps;
    private formatDuration;
    private initIViewData;
    private incrementIViewData;
    private getDate;
    private stringLogs;
}
