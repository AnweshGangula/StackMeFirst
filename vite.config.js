import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import { getManifest } from "./src/manifest.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let buildOptions = {};

  buildOptions = {
    sourcemap: true,
    rollupOptions: {
      output: {
        // assetFileNames: (assetInfo) => {
        //   // https://stackoverflow.com/a/71190586/6908282
        //   let extType = assetInfo.name.split('.').at(1);
        //   if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
        //     extType = 'img';
        //   }
        //   return `assets/${extType}/[name]-[hash][extname]`;
        // },
        // chunkFileNames: (chunkInfo) => {
        //   // reference: https://github.com/rollup/rollup/issues/2793#issuecomment-1011011760
        //   let hash = '-[hash]'
        //   if (chunkInfo.name == "executeScript") {
        //     hash = "";
        //   }
        //   return `assets/[name]${hash}.js`;
        // },
        // entryFileNames: (chunkInfo) => {
        //   // https://stackoverflow.com/a/72750548/6908282
        //   // assetInfo.facadeModuleId contains the file's full path
        //   if (chunkInfo.facadeModuleId) {
        //     return 'assets/js/[name]-[hash].js' // assetPath + '/[name]-[hash].js';

        //   } else {
        //     return 'assets/js/[name]-[hash].js';
        //   }
        // },
      },
    },
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
