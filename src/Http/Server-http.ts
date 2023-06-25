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
    protected useRoutes: RouteType;
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

        this.useRoutes = {};
        this.getRoutes = {};
        this.postRoutes = {};
        this.patchRoutes = {};
        this.deleteRoutes = {};
    }

    private handleData(data: Buffer, socket: net.Socket){
        // request informations
        const stringedData = data.toString();
        console.log(stringedData)
        const requestMethod = stringedData.split(" ")[0];
        const endPoint = stringedData.split(" ")[1].split("?")[0];
        const host = stringedData.split("\n")[1].split(" ")[1].slice(0, -1);

        const body = this.getBody(stringedData.split("\r\n"));
        const headers = this.getHeaders(stringedData.split("\r\n"));

        const query_params = stringedData.split(" ")[1].split("?")[1].split("&");
        const query = this.getQuery(query_params);

        const req = new Request({
            method: requestMethod,
            endpoint: endPoint,
            body: body,
            headers: headers,
            query: query,
            host: host
        });
        const res = new Response();

        if (requestMethod === "GET") {
            if (this.getRoutes.hasOwnProperty(endPoint) === false) {
                res.send("text/plain", "Cannot GET " + endPoint);
                const response = res.getResponse();
                socket.write(response);
                socket.end();
                return;
            }
            this.getRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          } 
          
          else if (requestMethod === "POST") {
            if (this.postRoutes.hasOwnProperty(endPoint) === false) {
                res.send("text/plain", "Cannot POST " + endPoint);
                const response = res.getResponse();
                socket.write(response);
                socket.end();
                return;
            }
            this.postRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          } 
          
          else if (requestMethod === "PATCH") {
            if (this.patchRoutes.hasOwnProperty(endPoint) === false) {
                res.send("text/plain", "Cannot PATCH " + endPoint);
                const response = res.getResponse();
                socket.write(response);
                socket.end();
                return;
            }
            this.patchRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          } 
          
          else if (requestMethod === "DELETE") {
            if (this.deleteRoutes.hasOwnProperty(endPoint) === false) {
                res.send("text/plain", "Cannot DELETE " + endPoint);
                const response = res.getResponse();
                socket.write(response);
                socket.end();
                return;
            }
            this.deleteRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          } 
          
          // generic method
          else if(this.useRoutes.hasOwnProperty(endPoint)){
            this.useRoutes[endPoint](req, res);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          }

          else {
            res.send("text/plain", `The endpoint ${endPoint} is not handled in any way`);
            const response = res.getResponse();
            socket.write(response);
            socket.end();
          };    
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

    public use(endPoint: string, handler: HandlerType){
        if(this.deleteRoutes.hasOwnProperty(endPoint)) throw new Error(`Endpoint ${endPoint} can't be handle with DELETE request in more than one way`);
        this.useRoutes[endPoint] = handler;
    }

    public listen(port: string | number, cb?: () => void){
        this.server.listen(port, cb ? () => cb() : () => console.log("Server Listening on port "+port));
    }

    private getBody(data: string[]): Object {
        let body = {};
        data.forEach((ele) => {
            if(ele[0] === "{") { return body = JSON.parse(ele); };
        })
        return body; 
    }

    private getHeaders(data: string[]): Object {
        type Header = { [key: string]: string };

        let header: Header = {};
        data.forEach((ele) => {
            if(ele === "") return;
            const splittedEle = ele.split(": ");
            if(splittedEle.length === 2){ header[splittedEle[0]] = splittedEle[1] };
        })
        return header;
    }

    private getQuery(data: string[]): Object{
        type Query= { [key: string]: string };

        let query: Query = {};
        data.forEach((ele) => {
            const splittedEle = ele.split("=");
            query[splittedEle[0]] = splittedEle[1];
        });

        return query;
    }
}