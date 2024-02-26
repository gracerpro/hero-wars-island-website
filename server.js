import fs from 'node:fs/promises'
import express from 'express'
import { getHtml } from "./common.js";

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = 8082;
const base = '/';

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/.vite/ssr-manifest.json', 'utf-8')
  : undefined

// Create http server
const app = express()

// Add Vite or respective production middlewares
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML
app.use('*', async (request, response) => {
  try {
    const url = request.originalUrl.replace(base, '');

    console.log("recieve url:", url);

    let html = await getAppHtml(url, ssrManifest);

    response.status(200).set({ 'Content-Type': 'text/html; charset=UTF-8' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    response.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
});


async function getAppHtml(url, manifest) {
  let template;
  let render;

  if (!isProduction) {
    // Always read fresh template in development
    template = await fs.readFile('./index.html', 'utf-8')

    // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
    //    and also applies HTML transforms from Vite plugins, e.g. global
    //    preambles from @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3a. Load the server entry. ssrLoadModule automatically transforms
    //    ESM source code to be usable in Node.js! There is no bundling
    //    required, and provides efficient invalidation similar to HMR.
    render = (await vite.ssrLoadModule('./src/entry-server.js')).render

    // 3b. Since Vite 5.1, you can use the experimental createViteRuntime API
    //    instead.
    //    It fully supports HMR and works in a simillar way to ssrLoadModule
    //    More advanced use case would be creating a runtime in a separate
    //    thread or even a different machine using ViteRuntime class
    //const runtime = await vite.createViteRuntime(server)
    //const { render } = await runtime.executeEntrypoint('/src/entry-server.js')
  } else {
    template = templateHtml;
    render = (await import('./dist/server/entry-server.js')).render
  }

  return getHtml(url, manifest, template, render);
}

/*
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

    if (router) {
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
    }
  });
}
*/
