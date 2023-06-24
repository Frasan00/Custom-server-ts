"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
class Router {
    constructor(input) {
        this.basePath = input.basePath;
    }
    get(endpoint, handler, middlewares) {
        if (middlewares) {
            middlewares.map((middleware) => {
                middleware;
            });
        }
        handler;
    }
    post(endpoint, Handler, middlewares) {
    }
    update(endpoint, handler, middlewares) {
    }
    delete(endpoint, Handler, middlewares) {
    }
}
exports.Router = Router;
