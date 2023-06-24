import { Server } from "../src/Http/Server-http";

const server = new Server();
server.listen(5000, () => console.log("Server listening on port "+5000));