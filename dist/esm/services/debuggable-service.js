import { Service } from '@e22m4u/js-service';
import { toCamelCase } from '../utils/index.js';
import { createDebugger } from '@e22m4u/js-debug';
/**
 * Service.
 */
export class DebuggableService extends Service {
    /**
     * Debug.
     */
    debug;
    /**
     * Возвращает функцию-отладчик с сегментом пространства имен
     * указанного в параметре метода.
     *
     * @param method
     * @protected
     */
    getDebuggerFor(method) {
        return this.debug.withHash().withNs(method.name);
    }
    /**
     * Constructor.
     *
     * @param container
     */
    constructor(container) {
        super(container);
        const serviceName = toCamelCase(this.constructor.name);
        this.debug = createDebugger(serviceName).withoutGlobalNs();
        const debug = this.debug.withNs('constructor').withHash();
        debug('Service created.');
    }
}
