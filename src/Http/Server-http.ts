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
};

export enum RequestEnum {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

export class Server {

    protected server: net.Server;
    protected getRoutes: RouteType;
    protected postRoutes: RouteType;
    protected patchRoutes: RouteType;
    protected deleteRoutes: RouteType;

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

        this.getRoutes = {};
        this.postRoutes = {};
        this.patchRoutes = {};
        this.deleteRoutes = {};
    }

    private handleData(data: Buffer, socket: net.Socket){
        const stringedData = data.toString();
        const requestMethod = stringedData.split("\n")[0].split(" ")[0];
        const endPoint = stringedData.split("\n")[0].split(" ")[1];
        // to do
        const params = this.getParams(endPoint);
        const body = this.getBody(stringedData);
        const headers = this.getHeaders(stringedData)

        const req = new Request({
            method: requestMethod,
            endpoint: endPoint,
            params: params,
            body: body,
            headers: headers
        });
        const res = new Response();

        if (requestMethod === "GET") {
            if (!this.getRoutes || !this.getRoutes.hasOwnProperty(endPoint)) {
              throw new Error("Cannot GET " + endPoint);
            }
            this.getRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          } 
          
          else if (requestMethod === "POST") {
            if (!this.postRoutes || !this.postRoutes.hasOwnProperty(endPoint)) {
              throw new Error("Cannot POST " + endPoint);
            }
            this.postRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          } 
          
          else if (requestMethod === "PATCH") {
            if (!this.patchRoutes || !this.patchRoutes.hasOwnProperty(endPoint)) {
              throw new Error("Cannot PATCH " + endPoint);
            }
            this.patchRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          } 
          
          else if (requestMethod === "DELETE") {
            if (!this.deleteRoutes || !this.deleteRoutes.hasOwnProperty(endPoint)) {
              throw new Error("Cannot DELETE " + endPoint);
            }
            this.deleteRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          } 
          
          else throw new Error("Request method not supported by this server");    
    }

    public get(endPoint: string, handler: HandlerType){
        if(this.getRoutes.hasOwnProperty(endPoint)) throw new Error(`Endpoint ${endPoint} can't be handle with GET request in more than one way`);
        this.getRoutes[endPoint] = handler;
    }

    public post(endPoint: string, handler: HandlerType){
        if(this.postRoutes.hasOwnProperty(endPoint)) throw new Error(`Endpoint ${endPoint} can't be handle with POST request in more than one way`);
        this.postRoutes[endPoint] = handler;
    }

    public patch(endPoint: string, handler: HandlerType){
        if(this.patchRoutes.hasOwnProperty(endPoint)) throw new Error(`Endpoint ${endPoint} can't be handle with PATCH request in more than one way`);
        this.patchRoutes[endPoint] = handler;
    }

    public delete(endPoint: string, handler: HandlerType){
        if(this.deleteRoutes.hasOwnProperty(endPoint)) throw new Error(`Endpoint ${endPoint} can't be handle with DELETE request in more than one way`);
        this.deleteRoutes[endPoint] = handler;
    }

    public listen(port: string | number, cb?: () => void){
        this.server.listen(port, cb ? () => cb() : () => console.log("Server Listening on port "+port));
    }

    // to do
    private getParams(endpoint: string){
        return {};
    }

    private getBody(data: string){
        return {};
    }

    private getHeaders(data: string){
        return {};
    }
}