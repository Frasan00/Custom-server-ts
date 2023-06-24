import { HandlerType, MiddlewareType } from "./Server-http";

interface IRouterInput {
    readonly basePath: string;
}

export class Router{

    protected basePath: string;
    
    public constructor(input: IRouterInput){
        this.basePath = input.basePath;
    }

    public get(endpoint: string, handler: HandlerType, middlewares?: MiddlewareType[]){
        if(middlewares){
            middlewares.map((middleware: MiddlewareType) => {
                middleware
            })
        }

        handler
    }

    public post(endpoint: string, Handler: HandlerType, middlewares?: MiddlewareType[]){
        
    }

    public update(endpoint: string, handler: HandlerType, middlewares?: MiddlewareType[]){

    }

    public delete(endpoint: string, Handler: HandlerType, middlewares?: MiddlewareType[]){
        
    }
}