import express from 'express'
import { renderToString } from 'vue/server-renderer'

const server = express()

server.get('/', (req, res) => {
  const context = {
    url: req.url,
  }

  console.log(req, res);

  renderToString(app, context)
  .then((html) => {
    console.log(html);
  })
  .catch((error) => {
    console.error("ERROR", error);
    /*
      if (+err.message === 404) {
        res.status(404).end('Page not found');
      } else {
        console.log(err);
        res.status(500).end('Internal Server Error');
      }
    */
  });
})

server.use("/dist");

server.listen(3000, () => {
  console.log('ready')
});

