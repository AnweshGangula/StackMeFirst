import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import { getManifest } from "./src/manifest.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let buildOptions = {};

  if (Number(env.VITE_MANIFEST_VERSION) == 2) {
    buildOptions = {
      rollupOptions: {
        output: {
          chunkFileNames: (chunkInfo) => {
            let hash = '-[hash]'
            if (chunkInfo.name == "executeScript") {
              hash = "";
            }
            return `assets/[name]${hash}.js`;
          },
        },
      },
    }
  }

  return {
    build: buildOptions,
    plugins: [
      svelte(),
      webExtension({
        manifest: getManifest(Number(env.VITE_MANIFEST_VERSION)),
      }),
    ],
    resolve: {
      alias: {
        "~": new URL("./src", import.meta.url).pathname,
      },
    },
  };
});
