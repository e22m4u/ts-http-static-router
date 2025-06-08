"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/esm/index.js
var index_exports = {};
__export(index_exports, {
  HttpStaticRouter: () => HttpStaticRouter
});
module.exports = __toCommonJS(index_exports);

// dist/esm/http-static-router.js
var import_path = __toESM(require("path"), 1);
var fs = __toESM(require("fs/promises"), 1);
var import_mime_types = __toESM(require("mime-types"), 1);
var import_fs = require("fs");
var import_js_format = require("@e22m4u/js-format");

// dist/esm/services/debuggable-service.js
var import_js_service = require("@e22m4u/js-service");

// dist/esm/utils/to-camel-case.js
function toCamelCase(input) {
  return input.replace(/(^\w|[A-Z]|\b\w)/g, (c) => c.toUpperCase()).replace(/\W+/g, "").replace(/(^\w)/g, (c) => c.toLowerCase());
}
__name(toCamelCase, "toCamelCase");

// dist/esm/services/debuggable-service.js
var import_js_debug = require("@e22m4u/js-debug");
var _DebuggableService = class _DebuggableService extends import_js_service.Service {
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
    this.debug = (0, import_js_debug.createDebugger)(serviceName).withoutEnvNs();
    const debug = this.debug.withNs("constructor").withHash();
    debug("Service created.");
  }
};
__name(_DebuggableService, "DebuggableService");
var DebuggableService = _DebuggableService;

// dist/esm/http-static-router.js
var _HttpStaticRouter = class _HttpStaticRouter extends DebuggableService {
  /**
   * Routes.
   *
   * @protected
   */
  routes = [];
  /**
   * Add route.
   *
   * @param remotePath
   * @param resourcePath
   */
  async addRoute(remotePath, resourcePath) {
    const debug = this.getDebuggerFor(this.addRoute);
    resourcePath = import_path.default.resolve(resourcePath);
    debug("Adding a new route.");
    debug("Resource path is %v.", resourcePath);
    debug("Remote path is %v.", remotePath);
    let stats;
    try {
      stats = await fs.stat(resourcePath);
    } catch (error) {
      console.error(error);
      throw new import_js_format.Errorf("Static resource path does not exist %v.", resourcePath);
    }
    const isFile = stats.isFile();
    debug("Resource type is %s.", isFile ? "File" : "Folder");
    const regexp = new RegExp(`^${remotePath}`, "i");
    const route = { remotePath, resourcePath, regexp, isFile };
    this.routes.push(route);
    return this;
  }
  /**
   * Match route.
   *
   * @param req
   */
  matchRoute(req) {
    const debug = this.getDebuggerFor(this.matchRoute);
    debug("Matching route by incoming request.");
    const url = req.url || "/";
    debug("Incoming request is %s %v.", req.method, url);
    debug("Walking through %v routes.", this.routes.length);
    const route = this.routes.find((route2) => {
      const res = route2.regexp.test(url);
      const phrase = res ? "matched" : "not matched";
      debug("Resource %v %s.", route2.resourcePath, phrase);
      return res;
    });
    route ? debug("Resource %v matched.", route.resourcePath) : debug("No route matched.");
    return route;
  }
  /**
   * Send file by route.
   *
   * @param route
   * @param req
   * @param res
   */
  sendFileByRoute(route, req, res) {
    const reqUrl = (req.url || "/").replace(/\?.*$/, "");
    if (/[^/]$/.test(route.remotePath) && reqUrl === route.remotePath) {
      res.writeHead(302, { location: `${reqUrl}/` });
      res.end();
      return;
    }
    let filePath = route.resourcePath;
    if (!route.isFile) {
      let relativePath = reqUrl.replace(new RegExp(`^${route.remotePath}`), "");
      if (!relativePath || relativePath === "/")
        relativePath = "/index.html";
      filePath = import_path.default.join(route.resourcePath, relativePath);
    }
    const resolvedPath = import_path.default.resolve(filePath);
    const resourceRoot = import_path.default.resolve(route.resourcePath);
    if (!resolvedPath.startsWith(resourceRoot)) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("403 Forbidden");
      return;
    }
    const extname = import_path.default.extname(resolvedPath);
    const contentType = import_mime_types.default.contentType(extname) || "application/octet-stream";
    const fileStream = (0, import_fs.createReadStream)(resolvedPath);
    fileStream.on("error", (error) => {
      if (res.headersSent)
        return;
      if ("code" in error && error.code === "ENOENT") {
        res.writeHead(404, { "content-type": "text/plain" });
        res.write("404 Not Found");
        res.end();
      } else {
        res.writeHead(500, { "content-type": "text/plain" });
        res.write("500 Internal Server Error");
        res.end();
      }
    });
    fileStream.on("open", () => {
      res.writeHead(200, { "content-type": contentType });
      fileStream.pipe(res);
    });
  }
};
__name(_HttpStaticRouter, "HttpStaticRouter");
var HttpStaticRouter = _HttpStaticRouter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpStaticRouter
});
