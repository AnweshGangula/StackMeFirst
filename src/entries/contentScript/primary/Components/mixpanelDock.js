import browser from "webextension-polyfill";
import { pageTypeEnum } from "~/utils/constants";
import { getUrlRootDomain, devConsole } from "~/utils/utils";

export default function DockMixpanel(event) {
    const website = getUrlRootDomain(window.location.href);

    devConsole("sending mixpanel event", {
        target: event.target,
        isButton: event.target instanceof HTMLButtonElement,
        btnId: event.target.id,
        text: event.target.textContent,
        website,
    });

    if (event.target instanceof HTMLButtonElement) {
        // mixpanel.trackEvent('dockBtnClicked', { 
        //     btnId: event.target.id ,
        //     text: event.target.textContent,
        //  });

        browser.runtime.sendMessage({
            //  reference: https://stackoverflow.com/a/20021813/6908282
            from: "contentScript",
            subject: "sendMixPanelData",
            eventName: 'btnClicked',
            content: {
                website,
                pageType: pageTypeEnum.sidebar,
                btnId: event.target.id,
                text: event.target.textContent,
            }
        }).then(function () {
            // console.log("sending message");
        });
    }
}