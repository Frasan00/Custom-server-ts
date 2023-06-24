import { ResponseType } from "./types/ResposeType";

type BaseHeaderType = `HTTP/1.1 ${number}`; // to complete

export type HeaderType =  {
    baseHeader: BaseHeaderType;
    contentType: ResponseType;
    value: any
}


export class Response {

    protected header: HeaderType;

    public constructor(){
        this.header = {
            baseHeader: `HTTP/1.1 400`,
            contentType: "text/plain",
            value: "Error during the http request"
        }
    }

    public getResponse(){
        return `${this.header.baseHeader}\r\nContent-Type: ${this.header.contentType}\r\n
${this.header.value}\r\n`
    }

    public send(contentType: ResponseType, value: any){
        this.header.contentType = contentType;
        this.header.value = value;
    }

    public status(status: number): Response{
        this.header.baseHeader = `HTTP/1.1 ${status}`;
        return this;
    }



}