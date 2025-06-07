import { Callable } from '../types.js';
import { Debugger } from '@e22m4u/js-debug';
import { Service } from '@e22m4u/js-service';
import { ServiceContainer } from '@e22m4u/js-service';
/**
 * Service.
 */
export declare class DebuggableService extends Service {
    /**
     * Debug.
     */
    debug: Debugger;
    /**
     * Возвращает функцию-отладчик с сегментом пространства имен
     * указанного в параметре метода.
     *
     * @param method
     * @protected
     */
    protected getDebuggerFor(method: Callable): Debugger;
    /**
     * Constructor.
     *
     * @param container
     */
    constructor(container?: ServiceContainer);
}
