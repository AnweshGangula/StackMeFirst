import browser from "webextension-polyfill";
import { pageTypeEnum } from "~/utils/constants";

import SmfMixpanel from "~/utils/mixpanel";

export default function optionsMixpanel() {
    window.addEventListener('load', () => {
        // pageView event is fired by default since we passed `track_pageview: true,`
        // mixpanel.trackEvent(document.title, document.location.href);

        const pageViewData = {
            website: pageTypeEnum.options,
            pageType: pageTypeEnum.options
        }
        const mixpanel = new SmfMixpanel(pageViewData);
    });

    // Listen globally for all button events
    document.addEventListener('click', (event) => {
        if (event.target instanceof HTMLButtonElement) {

            // mixpanel.trackEvent('popupBtnClicked', { 
            //     btnId: event.target.id ,
            //     text: event.target.textContent,
            // });

            browser.runtime.sendMessage({
                //  reference: https://stackoverflow.com/a/20021813/6908282
                from: "options",
                subject: "sendMixPanelData",
                eventName: 'btnClicked',
                content: {
                    website: pageTypeEnum.options,
                    pageType: pageTypeEnum.options,
                    btnId: event.target.id,
                    text: event.target.textContent,
                }
            }).then(function () {
                // console.log("sending message");
            });
        }
    });
}