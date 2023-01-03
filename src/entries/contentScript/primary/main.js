import highlightStack, { renderContent } from "../contentScript_main.js";
import App from "./App.svelte";

highlightStack().then((output) => {
  if (output.userConfig && output.userConfig.displaySidebar) {
    renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
      new App({
        target: appRoot,
        props: {
          stackData: output,
        }
      });
    });
  }
});

