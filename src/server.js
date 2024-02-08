import express from 'express'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './app.js'

const server = express()

server.get('/', (req, res) => {
  const app = createApp()

  renderToString(app).then((html) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vue SSR Example</title>
        <script type="module" src="/client.js"></script>
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>
    `)
  })
})

server.use(express.static('../public'));

server.listen(3000, () => {
  console.log('ready')
})