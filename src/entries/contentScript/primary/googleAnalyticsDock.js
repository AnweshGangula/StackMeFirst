import { Analytics } from "~/utils/googleAnalytics";

const gAnalytics = new Analytics();
export default function DockAnalytics(event) {
    // ref: https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/popup/popup.js

    // Listen globally for all button events
    // document.addEventListener('click', (event) => {
    if (event.originalTarget instanceof HTMLButtonElement) {
        // console.log("DockEvent", { event })
        gAnalytics.fireEvent('dockBtnClicked', { btnId: event.target.id });
    }
    // });
}