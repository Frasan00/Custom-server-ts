import { ContentType } from "./types/ContentTypes";
import net from "net";

export type HeaderType =  {
    baseHeader: string;
    contentType: ContentType;
}


export class Response {

    protected header: HeaderType | undefined;
    protected socket: net.Socket;
    protected status: number | undefined;
    protected value: any;

    public constructor(socket: net.Socket){
        this.socket = socket;
    }

    public send(contentType: ContentType, value: any) {
        this.header = {
          baseHeader: `HTTP/1.1 ${this.status}`,
          contentType: contentType,
        };
        this.value = value;
      
        const response = `HTTP/1.1 200 OK\r\nContent-Type: ${this.header.contentType}\n\r
${this.value}
`;
        this.socket.write(response);
        this.socket.end();
      }
      

    public responseStatus(status: number): Response{
        this.status = status;
        return this;
    }



}