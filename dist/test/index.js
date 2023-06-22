"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_ts_1 = require("../src/Server-ts");
const server = new Server_ts_1.Server({ port: 5000 });
console.log(server.getInfo());
