import pkg from "../package.json";
// manifest v3 available properties: https://developer.chrome.com/docs/extensions/mv3/manifest/
const stackCommunities = [
  "stackoverflow.com",
  "stackexchange.com",
  "mathoverflow.net",
  "askubuntu.com",
  "superuser.com",
  "serverfault.com",
  "stackapps.com",
]

const websiteList = [];

stackCommunities.forEach(a => {
  websiteList.push("*://*." + a + "/*");
});

const _webAccessibleResources = [
  // Reference: 
  "src/entries/contentScript/primary/content.css", // TODO: check if this shoud be in vite.config under additionalInputs
  'icons/StackMeFirst.png',
]

const sharedManifest = {
  homepage_url: pkg.homepage,
  content_scripts: [
    {
      js: ["src/entries/contentScript/primary/main.js"],
      css: ["src/entries/contentScript/primary/content.css"],
      matches: websiteList,
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
  permissions: ["tabs", "storage", "scripting", "identity"],
};


const v2Permissions = [...sharedManifest.permissions].filter((x) => !["scripting"].includes(x)) // reference: https://stackoverflow.com/a/68230395/6908282
const hostPermissions = [
  "*://api.stackexchange.com/*",
  ...websiteList
]

const browserAction = {
  default_title: "Stack Me First",
  default_icon: "./icons/StackMeFirst_disabled.png",
  default_popup: "src/entries/popup/index.html",
};

// remove "scripting" from manifest v2 permissions
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
  permissions: [...v2Permissions, ...hostPermissions],
  web_accessible_resources: _webAccessibleResources,
  browser_specific_settings: {
    gecko: {
      id: "{d86c700e-ef2b-4ce4-a2b1-23156eaeb2b5}",
      strict_min_version: "79.0"
    }
  },
};

const ManifestV3 = {
  ...sharedManifest,
  action: browserAction,
  background: {
    service_worker: "src/entries/background/serviceWorker.js",
  },
  host_permissions: hostPermissions,
  web_accessible_resources: [
    // reference: https://developer.chrome.com/docs/extensions/mv3/manifest/web_accessible_resources/
    //  reference: https://github.com/samrum/vite-plugin-web-extension/blob/86035ab7a48d52629c3c681f1ac6d9d77e091795/test/fixture/index/javascript/manifestV3/webAccessibleScript.ts#L16
    {
      resources: _webAccessibleResources,
      matches: websiteList,
    },
  ],
  oauth2: {
    // oauth2 not supported in manifest v2: https://stackoverflow.com/questions/51608064/error-processing-manifest-in-firefox#comment90182051_51608064
    client_id: "24029",
    scopes: ["read_inbox", "no_expiry", "private_info"],
  }
};

export function getManifest(manifestVersion) {
  const manifest = {
    manifest_version: manifestVersion,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
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
