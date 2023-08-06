import { Analytics } from "~/utils/googleAnalytics";

const gAnalytics = new Analytics();
export default function popupAnalytics(){
    // ref: https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/popup/popup.js
    // Fire a page view event on load
    window.addEventListener('load', () => {
        gAnalytics.firePageViewEvent(document.title, document.location.href);
    });
    
    // Listen globally for all button events
    document.addEventListener('click', (event) => {
      if (event.target instanceof HTMLButtonElement) {
        gAnalytics.fireEvent('popupBtnClicked', { btnId: event.target.id });
      }
    });
}