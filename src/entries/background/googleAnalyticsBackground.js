import browser from "webextension-polyfill";

import { Analytics } from "~/utils/googleAnalytics";

export default function backgroundAnalytics(){
    // ref: https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/service-worker.js
    addEventListener('unhandledrejection', async (event) => {
      Analytics.fireErrorEvent(event.reason);
    });
    
    browser.runtime.onInstalled.addListener(() => {
      Analytics.fireEvent('install');
    });
    
    // Throw an exception after a timeout to trigger an exception analytics event
    setTimeout(throwAnException, 2000);
    
    async function throwAnException() {
      throw new Error("👋 I'm an error");
    }
}