import net from "net";
import mqtt from "mqtt";

interface IBrokerInput {
    readonly keepAliveDelay?: number | 1000;
    readonly socketTimeout?: number;
    readonly onConnection?: () => any;
    readonly onError?: (error: Error) => void;
    readonly onClose?: () => void;
}

export class Broker {

    protected server: net.Server;

    public constructor(input?: IBrokerInput){
        const config = {
            keepAlive: input?.keepAliveDelay ? true : false, 
            keepAliveInitialDelay: input?.keepAliveDelay
        };

        this.server = net.createServer(config, (socket) => {
            let data = "";
            if(input?.socketTimeout) socket.setTimeout(input.socketTimeout);

            socket.on("connect", input?.onConnection ? input.onConnection : () => console.log("Client connected"));
            socket.on("error", input?.onError ? input.onError : () => console.error("An error occured during connection"));
            socket.on("close", input?.onClose ? input.onClose : () => console.log("Client disconnected "));
            socket.on("timeout", () => this.handleData(data, socket));

            socket.on("data", (chunk) => {
                // to do handle chunks
                data += chunk.toString();
                this.handleData(data, socket);
            })
        });
    }

    private handleData(data: string, socket: net.Socket){
        console.log(data); // to del
    }

    public listen(port: string | number, cb?: () => void){
        this.server.listen(port, cb ? () => cb() : () => console.log("Server Listening on port "+port));
    }
}