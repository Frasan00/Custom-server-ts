import net from "net";
import { Request } from "./Request";
import { Response } from "./Response";
import { NextFunction } from "./NextFunction";
import bodyParsingMethods from "./bodyParsingMethods";
import httpMetods from "./types/httpMetods";
import url from "url";
import queryString from "querystring";

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

type Headers = { [key: string]: string };

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
            let data = "";
            socket.on("connect", input?.onConnection ? input.onConnection : () => console.log("Client connected"));
            socket.on("error", input?.onError ? input.onError : () => console.error("An error occured during connection"));
            socket.on("close", input?.onClose ? input.onClose : () => console.log("Client disconnected "));

            socket.on("data", (chunk) => {
                data += chunk.toString();
                this.handleData(data, socket);
            });

            socket.on("timeout", () => this.handleData(data, socket));
        });
        
        this.useRoutes = {};
        this.getRoutes = {};
        this.postRoutes = {};
        this.patchRoutes = {};
        this.deleteRoutes = {};
    }

    private badPacket(socket: net.Socket, headersError?: boolean){
        // specific bad headers error
        if(headersError){
            const response = `HTTP/1.1 400\r\nContent-Type: text/plain\r\n
Invalid HTTP packet was sent, please format your headers correctly\r\n`;
            socket.write(response);
            socket.end();
            return;
        }

        const response = `HTTP/1.1 400\r\nContent-Type: text/plain\r\n
Invalid HTTP packet was sent, please format your data for an http request\r\n`;
            socket.write(response);
            socket.end();
    }

    private handleData(data: string, socket: net.Socket){
        // packet validation
        if(!data || !this.validatePackage(data) || data.split("\r\n").length < 2) {
            this.badPacket(socket);
            return;
        };
        console.log(data) // to del

        // request informations
        const requestMethod = data.split(" ")[0];
        const endPoint = data.split(" ")[1].split("?")[0];

        const headers: Headers = this.getHeaders(data.split("\r\n").slice(1), socket);

        const query = this.getQuery(data.split(" ")[1]);

        const req = new Request({
            method: requestMethod,
            endpoint: endPoint,
            body: {}, // Base case for get and delete
            headers: headers,
            query: query,
        });
        const res = new Response(socket);

        if (requestMethod === "GET") {
            if (!this.getRoutes.hasOwnProperty(endPoint)) {
                const response = `HTTP/1.1 400\r\nContent-Type: text/plain\r\n
Cannot GET ${endPoint}\r\n
`;
                socket.write(response);
                socket.end();
                return;
            }
            this.getRoutes[endPoint](req, res);
          } 
          
          else if (requestMethod === "POST") {
            if (!this.postRoutes.hasOwnProperty(endPoint)) {
                const response = `HTTP/1.1 400\r\nContent-Type: text/plain\r\n
Cannot POST ${endPoint}\r\n
`;
                socket.write(response);
                socket.end();
                return;
            }
            this.getRoutes[endPoint](req, res);
          } 
          
          else if (requestMethod === "PATCH") {
            if (!this.patchRoutes.hasOwnProperty(endPoint)) {
                const response = `HTTP/1.1 400\r\nContent-Type: text/plain\r\n
Cannot PATCH ${endPoint}\r\n
`;
                socket.write(response);
                socket.end();
                return;
            }
            this.getRoutes[endPoint](req, res);
          } 
          
          else if (requestMethod === "DELETE") {
            if (!this.deleteRoutes.hasOwnProperty(endPoint)) {
                const response = `HTTP/1.1 400\r\nContent-Type: text/plain\r\n
Cannot DELETE ${endPoint}\r\n
`;
                socket.write(response);
                socket.end();
                return;
            }
            this.getRoutes[endPoint](req, res);
          } 
          
          // generic method
          else if(this.useRoutes.hasOwnProperty(endPoint)){ this.useRoutes[endPoint](req, res); }

          else {
            const response = `HTTP/1.1 400\r\nContent-Type: text/plain\r\n
The endpoint ${endPoint} is not handled in any way\r\n
`;
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
        if(this.deleteRoutes.hasOwnProperty(endPoint)) throw new Error(`Endpoint ${endPoint} can't be handled in more than one way`);
        this.useRoutes[endPoint] = handler;
    }

    public listen(port: string | number, cb?: () => void){
        this.server.listen(port, cb ? () => cb() : () => console.log("Server Listening on port "+port));
    }

    private getBody(data: string[], headers: Headers, socket: net.Socket): Object {
        // No body provided case
        const headersKeys = Object.keys(headers);
        if(data[data.length -1] === "" || !headersKeys.includes("Content-Type")) return {};
        let body = {};
        
        const contentType = headers["Content-Type"];
        const bodyStartIndex = data.indexOf("") + 1;
        const dataBody = data.slice(bodyStartIndex);
        
        switch(contentType){
            case "application/json":
                body = JSON.parse(dataBody.join("\n"));
                break;

            case "text/plain" || "text/html":
                body = dataBody.join("\n");
                break;

            case "application/x-www-form-urlencoded":
                body = bodyParsingMethods.parseUrlEncodedBody(dataBody);
                break;
            
            default:
                this.badPacket(socket);
        }
        
        return body; 
    }

    private getHeaders(data: string[], socket: net.Socket): Headers {
        let header: Headers = {};
        if(!data) { this.badPacket(socket, true); }; // at least one host header has to be provided
        data.forEach((ele) => {
            if(ele === "") return; // finished headers part
            const delimiterIndex = ele.indexOf(":");
            if(delimiterIndex === -1) { this.badPacket(socket, true); };

            const headerKey = ele.slice(0, delimiterIndex);
            if(delimiterIndex + 1 >= ele.length) { this.badPacket(socket, true); }; // empty or not existing value for an header

            const valueKey = ele.slice(delimiterIndex+1, ele.length).trimStart();
            header[headerKey] = valueKey;
        })
        return header;
    }

    private getQuery(data: string): Object{
        const parsedUrl = url.parse(data);
        if(!parsedUrl.query) return {};
        return JSON.parse(JSON.stringify(queryString.parse(parsedUrl.query)));
    }

    // validates if a package is correctly formatted for http requests
    private validatePackage(data: string): boolean{
        enum HttpVersions {
            HTTP09 = "HTTP/0.9",
            HTTP10 = "HTTP/1.0",
            HTTP11 = "HTTP/1.1",
            HTTP2 = "HTTP/2",
            HTTP3 = "HTTP/3",
        }
        // basic requirements
        if(data.length === 0 || !data.includes("\r\n") || !data.includes("Host") || !data.includes("HTTP") || !httpMetods.includes(data.split(" ")[0])) return false;
        if(!data.includes("") || Object.keys(HttpVersions).includes(data.split(" ")[2])) return false;
        // to do: body parsed correctly
        return true;
    }
}