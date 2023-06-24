import net from "net";
import { Request } from "./Request";
import { Response } from "./Response";
import { NextFunction } from "./NextFunction";
import { Router } from "./Router";

interface IServerInput {
    readonly port: string | number;
    readonly keepAliveDelay?: number | 1000;
    readonly onServerConnection?: () => void;
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

    public constructor(input: IServerInput){
        const config = {
            keepAlive: input.keepAliveDelay ? true : false, 
            keepAliveInitialDelay: input.keepAliveDelay
        };

        this.server = net.createServer(config, (socket) => {
            socket.on("connect", input.onConnection ? input.onConnection : () => console.log("Client connected"));
            socket.on("error", input.onError ? input.onError : () => console.error("An error occured during connection"));
            socket.on("close", input.onClose ? input.onClose : () => console.log("Client disconnected "));

            socket.on("data", (data) => { this.handleData(data, socket); });
        });

        this.router = new Router({ basePath: "/" });
        this.server.listen(input.port, input.onServerConnection ? input.onServerConnection : () => { console.log(`Listening on port ${input.port}`); });
    }

    private handleData(data: Buffer, socket: net.Socket){
        const stringedData = data.toString();
        const request = stringedData.split("\n")[0].split(" ")[0];
        const endpoint = stringedData.split("\n")[0].split(" ")[1];
        
        socket.write("ksadkaskd")
    }

    public get(endpoint: string, handler: HandlerType, middlewares?: MiddlewareType[]): void {

    }

    public post(endpoint: string, handler: HandlerType, middlewares?: MiddlewareType[]): void {

    }

    public update(endpoint: string, handler: HandlerType, middlewares?: MiddlewareType[]): void {

    }

    public delete(endpoint: string, handler: HandlerType, middlewares?: MiddlewareType[]): void {

    }
    
}