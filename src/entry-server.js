import express from 'express'
import fs from "fs";
import path from "path";
import { renderToString } from 'vue/server-renderer'
import createApp from './main2.js';
import HttpError from './exceptions/HttpError.js';

const rootDirectory = process.cwd();
const port = 3000;
const server = express();

server.get('/', (request, response) => {
  handleRequest(request)
  .then((html) => {
    const template = fs.readFileSync(
      path.join(rootDirectory, '/dist/client/index.html'),
      "utf-8"
    );
    console.log("1", html);
    html = template.replace("<!--app-html-->", html);
    console.log("2", html);

    response
   // .setHeader("Content-Type", "text/html; charset=utf-8")
    .status(200)
    .send(html);
  })
  .catch((error) => {
    console.error("ERROR", error);

    if (error instanceof HttpError) {
      response.status(error.statusCode).end();
    } else {
      response.status(500).end();
    }
  })
});

server.use(express.static(path.join(rootDirectory, "/dist/client")));

server.listen(port, () => {
  console.log(`Server started at localhost:${port}. Press Ctrl+C to quit.`)
});



async function handleRequest(request) {
  const context = {
    url: request.url,
  }

  return new Promise((resolve, reject) => {
    // Each request - new instance
    const { app, router } = createApp();

    if (!app) {
      reject();
    }

    renderToString(app, context)
        .then((html) => resolve(html));

    return;

    router.push(context.url);

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      console.log("matchedComponents", matchedComponents);

      if (!matchedComponents.length) {
        return reject(new HttpError(404, "Page not found"));
      }

      renderToString(app, context)
        .then((html) => resolve(html));
    });
  });
}
