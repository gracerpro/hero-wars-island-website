import SwaggerUI from "swagger-ui";

import "swagger-ui/dist/swagger-ui.css";

const DisableTryItOutPlugin = function() {
  return {
    statePlugins: {
      spec: {
        wrapSelectors: {
          allowTryItOutFor: () => () => false
        }
      }
    }
  }
}

window.ui = SwaggerUI({
  url: "/backend-api/swagger.json",
  dom_id: "#swagger-ui",
  deepLinking: true,
  tryItOutEnabled: false, // this is not hide "Try it out" button
  supportedSubmitMethods: [], // but this hide "Try it out" button
  plugins: [
    DisableTryItOutPlugin
  ]
});
