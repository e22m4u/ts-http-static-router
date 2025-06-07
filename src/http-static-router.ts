import path from 'path';
import * as fs from 'fs/promises';
import mimeTypes from 'mime-types';
import {createReadStream} from 'fs';
import {ServerResponse} from 'node:http';
import {Errorf} from '@e22m4u/js-format';
import {IncomingMessage} from 'node:http';
import {DebuggableService} from './services/index.js';

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
export class HttpStaticRouter extends DebuggableService {
  /**
   * Routes.
   *
   * @protected
   */
  protected routes: HttpStaticRoute[] = [];

  /**
   * Add route.
   *
   * @param remotePath
   * @param resourcePath
   */
  async addRoute(remotePath: string, resourcePath: string): Promise<this> {
    const debug = this.getDebuggerFor(this.addRoute);
    resourcePath = path.resolve(resourcePath);
    debug('Adding a new route.');
    debug('Resource path is %v.', resourcePath);
    debug('Remote path is %v.', remotePath);
    let stats;
    try {
      stats = await fs.stat(resourcePath);
    } catch (error) {
      // если ресурс не существует в момент старта,
      // это может быть ошибкой конфигурации
      console.error(error);
      throw new Errorf('Static resource path does not exist %v.', resourcePath);
    }
    const isFile = stats.isFile();
    debug('Resource type is %s.', isFile ? 'File' : 'Folder');
    const regexp = new RegExp(`^${remotePath}`, 'i');
    const route = {remotePath, resourcePath, regexp, isFile};
    this.routes.push(route);
    return this;
  }

  /**
   * Match route.
   *
   * @param req
   */
  matchRoute(req: IncomingMessage) {
    const debug = this.getDebuggerFor(this.matchRoute);
    debug('Matching route by incoming request.');
    const url = req.url || '/';
    debug('Incoming request is %s %v.', req.method, url);
    debug('Walking through %v routes.', this.routes.length);
    const route = this.routes.find(route => {
      const res = route.regexp.test(url);
      const phrase = res ? 'matched' : 'not matched';
      debug('Resource %v %s.', route.resourcePath, phrase);
      return res;
    });
    route
      ? debug('Resource %v matched.', route.resourcePath)
      : debug('No route matched.');
    return route;
  }

  /**
   * Send file by route.
   *
   * @param route
   * @param req
   * @param res
   */
  sendFileByRoute(
    route: HttpStaticRoute,
    req: IncomingMessage,
    res: ServerResponse,
  ) {
    const reqUrl = (req.url || '/').replace(/\?.*$/, '');
    // так как в html обычно используются относительные
    // пути, то адрес папки статических ресурсов должен
    // завершаться косой чертой, что бы файлы стилей и
    // изображений загружались именно из нее,
    // а не обращались на уровень выше
    if (/[^/]$/.test(route.remotePath) && reqUrl === route.remotePath) {
      res.writeHead(302, {location: `${reqUrl}/`});
      res.end();
      return;
    }
    // если ресурс ссылается на папку, то из адреса
    // запроса извлекается относительный путь до файла,
    // и объединяется с адресом ресурса
    let filePath = route.resourcePath;
    if (!route.isFile) {
      // формирование относительного пути до файла
      // путем удаления из пути запроса той части,
      // которая была указана при объявлении маршрута
      let relativePath = reqUrl.replace(new RegExp(`^${route.remotePath}`), '');
      // если относительный путь указывает
      // на корень, то подставляется index.html
      if (!relativePath || relativePath === '/') relativePath = '/index.html';
      // объединение адреса ресурса
      // с относительным путем до файла
      filePath = path.join(route.resourcePath, relativePath);
    }
    // если обнаружена попытка выхода за пределы
    // корневой директории, то выбрасывается ошибка
    const resolvedPath = path.resolve(filePath);
    const resourceRoot = path.resolve(route.resourcePath);
    if (!resolvedPath.startsWith(resourceRoot)) {
      res.writeHead(403, {'content-type': 'text/plain'});
      res.end('403 Forbidden');
      return;
    }
    // формирование заголовка "content-type"
    // в зависимости от расширения файла
    const extname = path.extname(resolvedPath);
    const contentType =
      mimeTypes.contentType(extname) || 'application/octet-stream';
    // файл читается и отправляется частями,
    // что значительно снижает использование памяти
    const fileStream = createReadStream(resolvedPath);
    fileStream.on('error', error => {
      if (res.headersSent) return;
      if ('code' in error && error.code === 'ENOENT') {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.write('404 Not Found');
        res.end();
      } else {
        res.writeHead(500, {'content-type': 'text/plain'});
        res.write('500 Internal Server Error');
        res.end();
      }
    });
    // отправка заголовка 200, только после
    // этого начинается отдача файла
    fileStream.on('open', () => {
      res.writeHead(200, {'content-type': contentType});
      fileStream.pipe(res);
    });
  }
}
