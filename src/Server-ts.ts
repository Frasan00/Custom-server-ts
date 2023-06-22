import net from "net";

interface IServerInput {
    readonly port: string | number;
    readonly keepAliveDelay?: number | 1000;
    readonly onServerConnection?: () => void;
    readonly onConnection?: () => any;
    readonly onError?: (error: Error) => void;
    readonly onClose?: () => void;
}

export class Server {

    protected server: net.Server;

    public constructor(input: IServerInput){
        const config = {
            keepAlive: input.keepAliveDelay ? true : false, 
            keepAliveInitialDelay: input.keepAliveDelay
        };

        this.server = net.createServer(config, (socket) => {
            socket.on("connect", input.onConnection ? input.onConnection : () => console.log("Client connected"));
            socket.on("error", input.onError ? input.onError : () => console.error("An error occured during connection"));
            socket.on("close", input.onClose ? input.onClose : () => console.log("Client disconnected "));
        });

        this.server.listen(input.port, input.onServerConnection ? input.onServerConnection : () => { console.log(`Listening on port ${input.port}`); });
    }
}