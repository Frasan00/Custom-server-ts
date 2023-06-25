import { ContentType } from "./types/ContentTypes";

type BaseHeaderType = `HTTP/1.1 ${number}`; // to complete

export type HeaderType =  {
    baseHeader: BaseHeaderType;
    contentType: ContentType;
    value: any
}


export class Response {

    protected header: HeaderType;

    public constructor(){
        // Base case when send() isn't used in the cb(req, res)
        this.header = {
            baseHeader: `HTTP/1.1 400`,
            contentType: "text/plain",
            value: "Error during http request: NO_VALUE_GIVEN_FOR_RESPONSE_IN_THE_CALLBACK"
        }
    }

    public getResponse(){
        return `${this.header.baseHeader}\r\nContent-Type: ${this.header.contentType}\r\n
${this.header.value}\r\n`
    }

    public send(contentType: ContentType, value: any){
        this.header.contentType = contentType;
        this.header.value = value;
    }

    public status(status: number): Response{
        this.header.baseHeader = `HTTP/1.1 ${status}`;
        return this;
    }



}