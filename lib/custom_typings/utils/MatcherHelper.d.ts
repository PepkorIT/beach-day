declare namespace jasmine {
    interface Matchers {
        toBePassing(): boolean;
        throwExpectError(message:string): boolean;
        throwImplementationError(message:string): boolean;
        statusCodeToBe(statusCode:number): boolean;
    }
}