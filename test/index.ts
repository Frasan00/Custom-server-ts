import { Server } from "../src/Http/Server-http";

const server = new Server();

server.get("/", (req, res) => {
    console.log("request info:", req);
    res.responseStatus(200).send("text/plain", "Good request");
});

server.post("/paolo", (req, res) => {
    console.log("request info:", req);
    res.responseStatus(200).send("text/plain", "Good request");
});

server.listen(5000, () => console.log("Server listening on port "+5000));