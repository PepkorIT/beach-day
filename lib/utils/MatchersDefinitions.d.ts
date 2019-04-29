declare namespace jasmine {
    export interface Matchers<T> {
        toBePassing():boolean;

        throwExpectError(message:string):boolean;

        throwImplementationError(message:string):boolean;

        statusCodeToBe(statusCode:number):boolean;
    }
}
