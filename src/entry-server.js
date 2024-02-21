import { renderToString } from 'vue/server-renderer'
import createApp from './main2'

export async function render() {
  const { app } = createApp()

  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const context = {}
  const html = await renderToString(app, context)

  return { html }
}
