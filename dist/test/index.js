"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_http_1 = require("../src/Http/Server-http");
const server = new Server_http_1.Server();
server.get("/paolo", (req, res) => {
    res.status(200).send("text/plain", "Paolo ha detto che funziona");
});
server.get("/", (req, res) => {
    console.log("request info:", req);
    res.status(200).send("text/plain", "Good request");
});
server.get("/:name/:surname", (req, res) => {
    console.log("request info:", req);
    res.status(200).send("text/plain", "Good request");
});
server.listen(5000, () => console.log("Server listening on port " + 5000));
