"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const net_1 = __importDefault(require("net"));
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
            this.address = socket.address();
        });
        this.server.listen(input.port, input.onServerConnection ? input.onServerConnection : () => { console.log(`Listening on port ${input.port}`); });
    }
    getInfo() {
        const address = this.address;
        return { address };
    }
}
exports.Server = Server;
