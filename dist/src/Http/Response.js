"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
class Response {
    constructor() {
        // Base case when send() isn't used in the cb(req, res)
        this.header = {
            baseHeader: `HTTP/1.1 400`,
            contentType: "text/plain",
            value: "Error during http request: NO_VALUE_GIVEN_FOR_RESPONSE_IN_THE_CALLBACK"
        };
    }
    getResponse() {
        return `${this.header.baseHeader}\r\nContent-Type: ${this.header.contentType}\r\n
${this.header.value}\r\n`;
    }
    send(contentType, value) {
        this.header.contentType = contentType;
        this.header.value = value;
    }
    status(status) {
        this.header.baseHeader = `HTTP/1.1 ${status}`;
        return this;
    }
}
exports.Response = Response;
