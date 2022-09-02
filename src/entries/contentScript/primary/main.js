import highlightStack, { renderContent } from "../contentScript_main.js";
import App from "./App.svelte";

// renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
//   new App({
//     target: appRoot,
//   });
// });

highlightStack();
