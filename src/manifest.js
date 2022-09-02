import pkg from "../package.json";

const sharedManifest = {
  content_scripts: [
    {
      js: ["src/entries/contentScript/primary/main.js"],
      matches: ["*://*.stackoverflow.com/*"],
    },
  ],
  icons: {
    16: "icons/16.png",
    19: "icons/19.png",
    32: "icons/32.png",
    38: "icons/38.png",
    48: "icons/48.png",
    64: "icons/64.png",
    96: "icons/96.png",
    128: "icons/128.png",
    256: "icons/256.png",
    512: "icons/512.png",
  },
  options_ui: {
    page: "src/entries/options/index.html",
    open_in_tab: true,
  },
  permissions: ["tabs", "webNavigation", "storage", "scripting"],
};

const browserAction = {
  default_icon: "./icons/StackMeFirst_disabled.png",
  default_popup: "src/entries/popup/index.html",
};

// remove "scripting" from manifest v2 permissions
const v2Permissions = [...sharedManifest.permissions].filter((x) => !["scripting"].includes(x)) // reference: https://stackoverflow.com/a/68230395/6908282
const ManifestV2 = {
  ...sharedManifest,
  background: {
    scripts: ["src/entries/background/script.js"],
    persistent: false,
  },
  browser_action: browserAction,
  options_ui: {
    ...sharedManifest.options_ui,
    chrome_style: false,
  },
  permissions: [...v2Permissions, "*://*.stackoverflow.com/*"],
  web_accessible_resources: [
    "src/entries/executeScript/executeScript.js"
  ],
};

const ManifestV3 = {
  ...sharedManifest,
  action: browserAction,
  background: {
    service_worker: "src/entries/background/serviceWorker.js",
  },
  host_permissions: ["*://*.stackoverflow.com/*"],
};

export function getManifest(manifestVersion) {
  const manifest = {
    manifest_version: manifestVersion,
    author: pkg.author,
    description: pkg.description,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
  };

  if (manifestVersion === 2) {
    return {
      ...manifest,
      ...ManifestV2,
    };
  }

  if (manifestVersion === 3) {
    return {
      ...manifest,
      ...ManifestV3,
    };
  }

  throw new Error(
    `Missing manifest definition for manifestVersion ${manifestVersion}`
  );
}
