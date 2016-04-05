export declare class ExtendingObject<T, I> {
    constructor(defaults: I, params?: I);
    extend(instance: T, params: I): T;
    extender: (objectValue: any, sourceValue: any, key?: string, object?: any, source?: any) => any;
}
