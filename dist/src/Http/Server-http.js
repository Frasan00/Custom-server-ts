"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.RequestEnum = void 0;
const net_1 = __importDefault(require("net"));
const Response_1 = require("./Response");
const Router_1 = require("./Router");
var RequestEnum;
(function (RequestEnum) {
    RequestEnum["GET"] = "GET";
    RequestEnum["POST"] = "POST";
    RequestEnum["PUT"] = "PUT";
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
        this.router = new Router_1.Router({ basePath: "/" });
    }
    handleData(data, socket) {
        const stringedData = data.toString();
        const requestMethod = stringedData.split("\n")[0].split(" ")[0];
        const endpoint = stringedData.split("\n")[0].split(" ")[1];
        const response = new Response_1.Response({
            value: "Okkk",
            contentType: "text/plain",
            status: 200
        });
        socket.write(response.getResponse(), "utf-8");
        socket.end();
    }
    listen(port, cb) {
        this.server.listen(port, cb ? () => cb() : () => console.log("Server Listening on port " + port));
    }
}
exports.Server = Server;
