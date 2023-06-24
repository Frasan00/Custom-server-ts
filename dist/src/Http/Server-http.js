"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.RequestEnum = void 0;
const net_1 = __importDefault(require("net"));
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
            keepAlive: input.keepAliveDelay ? true : false,
            keepAliveInitialDelay: input.keepAliveDelay
        };
        this.server = net_1.default.createServer(config, (socket) => {
            socket.on("connect", input.onConnection ? input.onConnection : () => console.log("Client connected"));
            socket.on("error", input.onError ? input.onError : () => console.error("An error occured during connection"));
            socket.on("close", input.onClose ? input.onClose : () => console.log("Client disconnected "));
            socket.on("data", (data) => { this.handleData(data, socket); });
        });
        this.router = new Router_1.Router({ basePath: "/" });
        this.server.listen(input.port, input.onServerConnection ? input.onServerConnection : () => { console.log(`Listening on port ${input.port}`); });
    }
    handleData(data, socket) {
        const stringedData = data.toString();
        const request = stringedData.split("\n")[0].split(" ")[0];
        const endpoint = stringedData.split("\n")[0].split(" ")[1];
        socket.write("ksadkaskd");
    }
    get(endpoint, handler, middlewares) {
        this.router.get(endpoint, handler, middlewares);
    }
    post(endpoint, handler, middlewares) {
        this.router.post(endpoint, handler, middlewares);
    }
    update(endpoint, handler, middlewares) {
        this.router.update(endpoint, handler, middlewares);
    }
    delete(endpoint, handler, middlewares) {
        this.router.delete(endpoint, handler, middlewares);
    }
}
exports.Server = Server;
