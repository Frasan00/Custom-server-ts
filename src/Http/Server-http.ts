import net from "net";
import { Request } from "./Request";
import { Response } from "./Response";
import { NextFunction } from "./NextFunction";

interface IServerInput {
    readonly keepAliveDelay?: number | 1000;
    readonly onConnection?: () => any;
    readonly onError?: (error: Error) => void;
    readonly onClose?: () => void;
}

export type MiddlewareType = (req: Request, res: Response, nextFunc: NextFunction) => any;

export type HandlerType = (req: Request, res: Response) => any;

type RouteType = {
    [key: string]: HandlerType;
} | null;

export enum RequestEnum {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

export class Server {

    protected server: net.Server;
    protected getRoutes: RouteType | null;
    protected postRoutes: RouteType | null;
    protected putRoutes: RouteType | null;
    protected deleteRoutes: RouteType | null;

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

        this.getRoutes = null;
        this.postRoutes = null;
        this.putRoutes = null;
        this.deleteRoutes = null;
    }

    private handleData(data: Buffer, socket: net.Socket){
        const stringedData = data.toString();
        const requestMethod = stringedData.split("\n")[0].split(" ")[0];
        const endPoint = stringedData.split("\n")[0].split(" ")[1];

        switch(requestMethod){
            case("GET"):
                if(!this.getRoutes || !this.getRoutes.hasOwnProperty(endPoint)) throw new Error("Cannot GET "+endPoint);
                this.getRoutes.endPoint
        }

    }

    public get(endPoint: string, handler: HandlerType){
        const req = new Request();
        const res = new Response();
        if(!this.getRoutes || !this.getRoutes.hasOwnProperty(endPoint)) throw new Error("Cannot GET "+endPoint);
        this.getRoutes.endPoint = handler(req, res);
    }

    public listen(port: string | number, cb?: () => void){
        this.server.listen(port, cb ? () => cb() : () => console.log("Server Listening on port "+port));
    }
}