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
    viewDataDir: string;
    reportDynamicName: string;
    reportDynamicPath: string;
    latestReportName: string;
    reportStaticPath: string;
}
export declare function setCurrentEnvironment(env: JasmineAsyncEnv): void;
export declare function clearCurrentEnvironment(): void;
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
    private store(args, logger);
}
export declare var console: ReporterConsole;
export declare class BeachDayReporter {
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
