import browser from "webextension-polyfill";
(async () => {
  const src = browser.runtime.getURL('./contentScript_main.js');
  const contentScript = await import(src);
  contentScript.scrollToTarget();
})();
