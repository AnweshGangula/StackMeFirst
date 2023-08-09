import browser from "webextension-polyfill";
import { pageTypeEnum } from "~/utils/constants";

import SmfMixpanel from "~/utils/mixpanel";

export default function backgroundMixpanel() {
    const pageViewData = {
        website: pageTypeEnum.background,
        pageType: pageTypeEnum.background
    }
    const mixpanel = new SmfMixpanel(); // no need to track background pageview in mixpanel

    addEventListener('unhandledrejection', async (event) => {
        // console.log("error", {event})
        mixpanel.trackEvent("StackMeFirst_Error", {
            error: event.reason.toString(),
            website: pageTypeEnum.background,
            pageType: pageTypeEnum.background
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
