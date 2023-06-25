"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_http_1 = require("../src/Http/Server-http");
const server = new Server_http_1.Server();
server.get("/giggino", (req, res) => {
    res.status(200).send("text/plain", "Giggino ha detto che va bene");
});
server.listen(5000, () => console.log("Server listening on port " + 5000));
