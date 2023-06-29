import { Server } from "../src/Http/Server-http";
import { Request } from "../src/Http/Request";
import { Response } from "../src/Http/Response";

const server = new Server();

server.get("/paolo", (req: Request, res: Response) => {
    res.responseStatus(200).send("text/plain", "Paolo ha detto che funziona");
});

server.get("/", (req, res) => {
    console.log("request info:", req);
    res.responseStatus(200).send("text/plain", "Good request");
});

server.post("/paolo", (req, res) => {
    console.log("request info:", req);
    res.responseStatus(200).send("text/plain", "Good request");
});

server.listen(5000, () => console.log("Server listening on port "+5000));