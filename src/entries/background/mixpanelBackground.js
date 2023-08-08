import browser from "webextension-polyfill";

import SmfMixpanel from "~/utils/mixpanel";

export default function backgroundMixpanel() {
    const mixpanel = new SmfMixpanel("", true);

    addEventListener('unhandledrejection', async (event) => {
        // console.log("error", {event})
        mixpanel.trackEvent("extension_error", {
            error: event.reason.toString()
        });
    });

    browser.runtime.onInstalled.addListener((details) => {
        if (details.reason == 'install') {
            mixpanel.trackEvent('installed StackMeFirst');
        } else if (details.reason == 'update') {
            mixpanel.trackEvent('updated StackMeFirst');
        }
    });

    // Throw an exception after a timeout to trigger an test exception mixpanel event
    // setTimeout(throwAnException, 2000);

    async function throwAnException() {
        throw new Error("👋 I'm an test error for mixpanel");
      }

    return mixpanel;
}
