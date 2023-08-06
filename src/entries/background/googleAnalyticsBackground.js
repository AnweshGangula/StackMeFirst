import browser from "webextension-polyfill";

import { Analytics } from "~/utils/googleAnalytics";

const gAnalytics = new Analytics();
export default function backgroundAnalytics(){
    // ref: https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/service-worker.js
    addEventListener('unhandledrejection', async (event) => {
        // console.log("error", {event})
        gAnalytics.fireErrorEvent(event.reason);
    });
    
    // console.log("running installed tracking")
    browser.runtime.onInstalled.addListener((details) => {
        if (details.reason == 'install') {
            gAnalytics.fireEvent('installed StackMeFirst');
        } else if (details.reason == 'update') {
            gAnalytics.fireEvent('updated StackMeFirst');
        }
    });
    
    // Throw an exception after a timeout to trigger an exception analytics event
    // setTimeout(throwAnException, 2000);
    
    async function throwAnException() {
      throw new Error("👋 I'm an error");
    }
}