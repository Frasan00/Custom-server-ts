interface IRequestInput {
    readonly method: string;
    readonly endpoint: string;
    readonly params: Object;
    readonly body: Object;
    readonly headers: HeadersType;
}

type HeadersType = {

}

export class Request {
    
    public method: string;
    public endpoint: string;
    public params: Object;
    public body: Object;
    public headers: HeadersType;

    public constructor(input: IRequestInput){
        this.method = input.method;
        this.endpoint = input.endpoint;
        this.params = input.params;
        this.body = input.body;
        this.headers = input.headers;  
    }
}