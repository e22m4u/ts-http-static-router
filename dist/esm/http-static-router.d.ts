import { ServerResponse } from 'node:http';
import { IncomingMessage } from 'node:http';
import { DebuggableService } from './services/index.js';
/**
 * Static file route.
 */
type HttpStaticRoute = {
    remotePath: string;
    resourcePath: string;
    regexp: RegExp;
    isFile: boolean;
};
/**
 * Http static router.
 */
export declare class HttpStaticRouter extends DebuggableService {
    /**
     * Routes.
     *
     * @protected
     */
    protected routes: HttpStaticRoute[];
    /**
     * Add route.
     *
     * @param remotePath
     * @param resourcePath
     */
    addRoute(remotePath: string, resourcePath: string): Promise<this>;
    /**
     * Match route.
     *
     * @param req
     */
    matchRoute(req: IncomingMessage): HttpStaticRoute | undefined;
    /**
     * Send file by route.
     *
     * @param route
     * @param req
     * @param res
     */
    sendFileByRoute(route: HttpStaticRoute, req: IncomingMessage, res: ServerResponse): void;
}
export {};
