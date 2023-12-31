interface IRequestInput {
    readonly method: string;
    readonly endpoint: string;
    readonly body: Object;
    readonly headers: Object;
    readonly query: Object;
}

export class Request {
    
    public method: string;
    public endpoint: string;
    public body: Object;
    public headers: Object;
    public query: Object;

    public constructor(input: IRequestInput){
        this.method = input.method;
        this.endpoint = input.endpoint;
        this.body = input.body;
        this.headers = input.headers;  
        this.query = input.query;
    }
}