"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
class Response {
    constructor(input) {
        this.header = {
            baseHeader: "HTTP/1.1 200 OK",
            contentType: input.contentType,
            value: input.value
        };
    }
    getResponse() {
        return `${this.header.baseHeader}\r\nContent-Type: ${this.header.contentType}\r\n
${this.header.value}\r\n
        `;
    }
}
exports.Response = Response;
