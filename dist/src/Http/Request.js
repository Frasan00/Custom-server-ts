"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
class Request {
    constructor(input) {
        this.method = input.method;
        this.endpoint = input.endpoint;
        this.body = input.body;
        this.headers = input.headers;
        this.query = input.query;
        this.host = input.host;
    }
}
exports.Request = Request;
