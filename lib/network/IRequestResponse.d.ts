/// <reference types="node" />
import { Url } from "url";
export interface IRequestResponse {
    statusCode: number;
    request: IRequest;
    body?: any;
    headers?: any;
}
export interface IRequest {
    uri: Url;
    method: string;
    headers: any;
    body?: any;
}
