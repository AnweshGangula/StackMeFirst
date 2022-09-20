# Contribution

In order to contribute or run this plugin locally, you can follow the following steps:

1. Clone this repository locally using git

   ```bash
   git clone https://github.com/AnweshGangula/StackMeFirst.git
   ```

2. Open the cloned repository in your favorite IDE and open this directory in the integrated terminal

   ```bash
   cd StackMeFirst
   ```

3. Install the NPM packages

   ```bash
   npm install
   ```

4. Before bundling the plugin in the next step, note that the code uses [`vite.config.js`](./vite.config.js) to bundle code which uses the environment variable named `VITE_MANIFEST_VERSION` from the [./.env](./.env) file to bundle the files to manifest v2 or manifest v3 as per the variable value. Make sure to change it as required before proceeding.

5. Once the the node package installation is done (in step 3) & you have chosen the manifest version (in step 4) you can bundle the source code using

   ```bash
   npm run build
   ```

   Alternatively, you can also run `npm run dev` to enable HMR (only if you're using manifest v2) or use `npm run watch` to automatically bundle files on change.

6. The above step will create a new folder called `dist` in the root directory which contains the code & `manifest.json` file that you can use to load the plugin temporarily into your browser.

   - Alternatively, you can run `npm run serve:chrome` or `npm run serve:firefox` to automatically open a isolated instance of chrome/firefox with the plugin automatically loaded

> Note:
>
> - Please note that all the main source code is located in the [./src](./src/) folder
> - This code makes use of the [@samrum/vite-plugin-web-extension][1] npm package to initialize and bundle the files. Check out the [GitHub repository][2] for more details.

# Additional Info

The code in this [./src](./src) uses [@samrum/vite-plugin-web-extension][4] npm package to build browser extension for Manifest V2 & V3 using Svelte + Vite.

## Chrome:

[Manifest version 2 is no longer being maintained][5]

> As of January 17, 2022 Chrome Web Store has stopped accepting new Manifest V2 extensions. We strongly recommend that new extensions target Manifest V3.

[Manifest V3 migration checklist][6]

## Edge:

[Overview and timelines for migrating to Manifest V3][7]

## FireFox:

- [Manifest V3 migration guide][8]
- [Manifest v3 in Firefox: Recap & Next Steps][9]

[1]: https://www.npmjs.com/package/@samrum/vite-plugin-web-extension
[2]: https://github.com/samrum/vite-plugin-web-extension
[4]: https://github.com/samrum/vite-plugin-web-extension
[5]: https://developer.chrome.com/docs/extensions/mv2/
[6]: https://developer.chrome.com/docs/extensions/mv3/mv3-migration-checklist/
[7]: https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/manifest-v3
[8]: https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/
[9]: https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/
