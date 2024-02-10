import express from 'express'
import { renderToString } from 'vue/server-renderer'
import createApp from './main.js';

console.log("RUN server.js");

const server = express();

server.get('/', (request, response) => {
  console.log(request, response);

  handleRequest(request)
  .then((html) => {
    console.log(html);

    response.send(html);
  })
  .catch((error) => {
    console.error("ERROR", error);

    if (+err.message === 404) {
      response.status(404).end("Page not found");
    } else {
      response.status(500).end("Internal Server Error");
    }
  })
});

server.use(express.static("dist/server"));

server.listen(3000, () => {
  console.log("ready")
});



async function handleRequest(request) {
  const context = {
    url: request.url,
  }

  return new Promise((resolve, reject) => {
    // Each request - new instance
    const { app, router } = createApp();

    console.log("after use", app);

    router.push(context.url);

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      console.log("matchedComponents", matchedComponents);

      if (!matchedComponents.length) {
        return reject(new Error(404));
      }

      renderToString(app, context)
        .then(() => resolve(html));
    });
  });
}
