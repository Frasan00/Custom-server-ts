import net from "net";
import { Request } from "./Request";
import { Response } from "./Response";
import { NextFunction } from "./NextFunction";
import bodyParsingMethods from "./bodyParsingMethods";
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

export enum RequestEnum {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
    HEAD = "HEAD",
    PUT = "PUT",
    CONNECT = "CONNECT",
    TRACE = "TRACE",
    OPTIONS = "OPTIONS"
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
        // packet validation
        const stringedData = data.toString();
        if(this.validatePackage(stringedData) === false) {
            const response = `HTTP/1.1 400\r\nContent-Type: text/plain\r\n
Invalid HTTP packet was sent, please format your data for an http request\r\n`;
            socket.write(response);
            socket.end();
            return;
        };
        console.log(stringedData) // to del

        // request informations
        const requestMethod = stringedData.split(" ")[0];
        const endPoint = stringedData.split(" ")[1].split("?")[0];
        const host = stringedData.split("\n")[1].split(" ")[1].slice(0, -1);

        const headers: Headers = this.getHeaders(stringedData.split("\r\n"));
        const body = this.getBody(stringedData.split("\r\n"), headers);

        const query = this.getQuery(stringedData.split(" ")[1]);

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

    private getBody(data: string[], headers: Headers): Object {
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

            case "text/plain":
                body = dataBody.join("\n");
                break;

            case "text/html":
                body = dataBody.join("\n");
                break;

            case "application/x-www-form-urlencoded":
                body = bodyParsingMethods.parseUrlEncodedBody(dataBody);
                break;
            
            default:
            throw new Error(`Unsupported Content-Type: ${contentType}`);
        }
        
        return body; 
    }

    private getHeaders(data: string[]): Headers {
        let header: Headers = {};
        data.forEach((ele) => {
            if(ele === "") return; // finished headers part
            const splittedEle = ele.split(": ");
            if(splittedEle.length === 2){ header[splittedEle[0]] = splittedEle[1] };
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
        if(data.length === 0 || !data.includes("\r\n") || !data.includes("Host") || !data.includes("HTTP") || !Object.keys(RequestEnum).includes(data.split(" ")[0])) return false;
        if(!data.includes("") || Object.keys(HttpVersions).includes(data.split(" ")[2])) return false;
        // to do: body parsed correctly
        return true;
    }
}