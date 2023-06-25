"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.RequestEnum = void 0;
const net_1 = __importDefault(require("net"));
const Request_1 = require("./Request");
const Response_1 = require("./Response");
var RequestEnum;
(function (RequestEnum) {
    RequestEnum["GET"] = "GET";
    RequestEnum["POST"] = "POST";
    RequestEnum["PATCH"] = "PATCH";
    RequestEnum["DELETE"] = "DELETE";
})(RequestEnum || (exports.RequestEnum = RequestEnum = {}));
class Server {
    constructor(input) {
        const config = {
            keepAlive: (input === null || input === void 0 ? void 0 : input.keepAliveDelay) ? true : false,
            keepAliveInitialDelay: input === null || input === void 0 ? void 0 : input.keepAliveDelay
        };
        this.server = net_1.default.createServer(config, (socket) => {
            socket.on("connect", (input === null || input === void 0 ? void 0 : input.onConnection) ? input.onConnection : () => console.log("Client connected"));
            socket.on("error", (input === null || input === void 0 ? void 0 : input.onError) ? input.onError : () => console.error("An error occured during connection"));
            socket.on("close", (input === null || input === void 0 ? void 0 : input.onClose) ? input.onClose : () => console.log("Client disconnected "));
            socket.on("data", (data) => { this.handleData(data, socket); });
        });
        this.useRoutes = {};
        this.getRoutes = {};
        this.postRoutes = {};
        this.patchRoutes = {};
        this.deleteRoutes = {};
    }
    handleData(data, socket) {
        // request informations
        const stringedData = data.toString();
        console.log(stringedData);
        const requestMethod = stringedData.split(" ")[0];
        const endPoint = stringedData.split(" ")[1].split("?")[0];
        const host = stringedData.split("\n")[1].split(" ")[1].slice(0, -1);
        const params = this.getParams(endPoint);
        const body = this.getBody(stringedData.split("\r\n"));
        const headers = this.getHeaders(stringedData.split("\r\n"));
        const query_params = stringedData.split(" ")[1].split("?")[1].split("&");
        const query = this.getQuery(query_params);
        const req = new Request_1.Request({
            method: requestMethod,
            endpoint: endPoint,
            params: params,
            body: body,
            headers: headers,
            query: query,
            host: host
        });
        const res = new Response_1.Response();
        if (requestMethod === "GET") {
            if (this.getRoutes.hasOwnProperty(endPoint) === false) {
                res.send("text/plain", "Cannot GET " + endPoint);
                const response = res.getResponse();
                socket.write(response);
                socket.end();
                return;
            }
            this.getRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
        }
        else if (requestMethod === "POST") {
            if (this.postRoutes.hasOwnProperty(endPoint) === false) {
                res.send("text/plain", "Cannot POST " + endPoint);
                const response = res.getResponse();
                socket.write(response);
                socket.end();
                return;
            }
            this.postRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
        }
        else if (requestMethod === "PATCH") {
            if (this.patchRoutes.hasOwnProperty(endPoint) === false) {
                res.send("text/plain", "Cannot PATCH " + endPoint);
                const response = res.getResponse();
                socket.write(response);
                socket.end();
                return;
            }
            this.patchRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
        }
        else if (requestMethod === "DELETE") {
            if (this.deleteRoutes.hasOwnProperty(endPoint) === false) {
                res.send("text/plain", "Cannot DELETE " + endPoint);
                const response = res.getResponse();
                socket.write(response);
                socket.end();
                return;
            }
            this.deleteRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
        }
        // generic method
        else if (this.useRoutes.hasOwnProperty(endPoint)) {
            this.useRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
        }
        else {
            res.send("text/plain", `The endpoint ${endPoint} is not handled in any way`);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
        }
        ;
    }
    get(endPoint, handler) {
        if (this.getRoutes.hasOwnProperty(endPoint))
            throw new Error(`Endpoint ${endPoint} can't be handle with GET request in more than one way`);
        this.getRoutes[endPoint] = handler;
    }
    post(endPoint, handler) {
        if (this.postRoutes.hasOwnProperty(endPoint))
            throw new Error(`Endpoint ${endPoint} can't be handle with POST request in more than one way`);
        this.postRoutes[endPoint] = handler;
    }
    patch(endPoint, handler) {
        if (this.patchRoutes.hasOwnProperty(endPoint))
            throw new Error(`Endpoint ${endPoint} can't be handle with PATCH request in more than one way`);
        this.patchRoutes[endPoint] = handler;
    }
    delete(endPoint, handler) {
        if (this.deleteRoutes.hasOwnProperty(endPoint))
            throw new Error(`Endpoint ${endPoint} can't be handle with DELETE request in more than one way`);
        this.deleteRoutes[endPoint] = handler;
    }
    use(endPoint, handler) {
        if (this.deleteRoutes.hasOwnProperty(endPoint))
            throw new Error(`Endpoint ${endPoint} can't be handle with DELETE request in more than one way`);
        this.useRoutes[endPoint] = handler;
    }
    listen(port, cb) {
        this.server.listen(port, cb ? () => cb() : () => console.log("Server Listening on port " + port));
    }
    // to do
    getParams(endpoint) {
        return {};
    }
    getBody(data) {
        let body = {};
        data.forEach((ele) => {
            if (ele[0] === "{") {
                return body = JSON.parse(ele);
            }
            ;
        });
        return body;
    }
    getHeaders(data) {
        let header = {};
        data.forEach((ele) => {
            if (ele === "")
                return;
            const splittedEle = ele.split(": ");
            if (splittedEle.length === 2) {
                header[splittedEle[0]] = splittedEle[1];
            }
            ;
        });
        return header;
    }
    getQuery(data) {
        let query = {};
        data.forEach((ele) => {
            const splittedEle = ele.split("=");
            query[splittedEle[0]] = splittedEle[1];
        });
        return query;
    }
}
exports.Server = Server;
