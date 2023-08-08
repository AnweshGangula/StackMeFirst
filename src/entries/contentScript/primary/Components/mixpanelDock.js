import browser from "webextension-polyfill";
import { devConsole } from "~/utils/utils";

export default function DockMixpanel(event) {
    devConsole("sending mixpanel event", {
        target: event.target,
        isButton: event.target instanceof HTMLButtonElement,
        btnId: event.target.id,
        text: event.target.textContent,
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
            eventName: 'dockBtnClicked',
            content: {
                btnId: event.target.id,
                text: event.target.textContent,
            }
        }).then(function () {
            // console.log("sending message");
        });
    }
}