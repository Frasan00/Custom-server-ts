import { Server } from "../src/Http/Server-http";
import { Request } from "../src/Http/Request";
import { Response } from "../src/Http/Response";

const server = new Server();

server.get("/paolo", (req: Request, res: Response) => {
    res.status(200).send("text/plain", "Paolo ha detto che funziona");
});

server.listen(5000, () => console.log("Server listening on port "+5000));