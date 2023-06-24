import net from "net";
import { Request } from "./Request";
import { Response } from "./Response";
import { NextFunction } from "./NextFunction";
import { Router } from "./Router";

interface IServerInput {
    readonly keepAliveDelay?: number | 1000;
    readonly onConnection?: () => any;
    readonly onError?: (error: Error) => void;
    readonly onClose?: () => void;
}

export type MiddlewareType = (req: Request, res: Response, nextFunc: NextFunction) => any;

export type HandlerType = (req: Request, res: Response) => any;

export enum RequestEnum {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

export class Server {

    protected server: net.Server;
    protected router: Router;

    public constructor(input?: IServerInput){
        const config = {
            keepAlive: input?.keepAliveDelay ? true : false, 
            keepAliveInitialDelay: input?.keepAliveDelay
        };

        this.server = net.createServer(config, (socket) => {
            socket.on("connect", input?.onConnection ? input.onConnection : () => console.log("Client connected"));
            socket.on("error", input?.onError ? input.onError : () => console.error("An error occured during connection"));
            socket.on("close", input?.onClose ? input.onClose : () => console.log("Client disconnected "));

            socket.on("data", (data) => { this.handleData(data, socket); });
        });

        this.router = new Router({ basePath: "/" });
    }

    private handleData(data: Buffer, socket: net.Socket){
        const stringedData = data.toString();
        const requestMethod = stringedData.split("\n")[0].split(" ")[0];
        const endpoint = stringedData.split("\n")[0].split(" ")[1];

        const response = new Response({
            value: "Okkk",
            contentType: "text/plain",
            status: 200
        });
        
        socket.write(response.getResponse(), "utf-8");
        socket.end();
    }

    public listen(port: string | number, cb?: () => void){
        this.server.listen(port, cb ? () => cb() : () => console.log("Server Listening on port "+port));
    }
    
}