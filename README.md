## @e22m4u/ts-http-static-router

HTTP-маршрутизатор статичных ресурсов.

## Установка

```bash
npm install @e22m4u/ts-http-static-router
```

## Использование

```ts
import http from 'http';
import {HttpStaticRouter} from '@e22m4u/ts-http-static-router';

// обертка инициализации в асинхронную функцию
async function main() {
  // создание экземпляра маршрутизатора
  const staticRouter = new HttpStaticRouter();

  // добавление маршрутов:
  // (Promise.all для параллельной и быстрой инициализации)
  await Promise.all([
    // объявление содержимого папки "../static"
    // доступным по URL "/static"
    staticRouter.addRoute(
      '/static',                          // путь маршрута
      `${import.meta.dirname}/../static`, // файловый путь
    ),
    // объявление отдельного файла
    staticRouter.addRoute(
      '/favicon.ico',
      `${import.meta.dirname}/../static/favicon.ico`,
    ),
  ]);

  // создание HTTP сервера и подключение обработчика
  const server = new http.Server();
  server.on('request', (req, res) => {
    // если статический маршрут найден,
    // выполняется поиск и отдача файла
    const staticRoute = staticRouter.matchRoute(req);
    if (staticRoute) staticRouter.sendFileByRoute(staticRoute, req, res);
    // в противном случае запрос обрабатывается
    // основной логикой приложения
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello from App!');
  });

  server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('Try to open:');
    console.log('http://localhost:3000/static/');
    console.log('http://localhost:3000/favicon.ico');
  });
}

// запуск
main().catch(error => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
