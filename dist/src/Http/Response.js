"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
class Response {
    constructor() {
        this.header = {
            baseHeader: `HTTP/1.1 400`,
            contentType: "text/plain",
            value: "Error during the http request"
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
