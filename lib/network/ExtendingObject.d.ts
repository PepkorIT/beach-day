export declare class ExtendingObject<T, I> {
    constructor(params?: I);
    extend(instance: T, params: I): T;
    extender: (objectValue: any, sourceValue: any, key?: string, object?: any, source?: any) => any;
}
