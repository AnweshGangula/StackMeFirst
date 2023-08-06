import SmfMixpanel from "~/utils/mixpanel";

const mixpanel = new SmfMixpanel("", true);

export default function popupMixpanel() {
    window.addEventListener('load', () => {
        // pageView event is fired by default since we passed `track_pageview: true,`
        // mixpanel.trackEvent(document.title, document.location.href);
    });

    // Listen globally for all button events
    document.addEventListener('click', (event) => {
        if (event.originalTarget instanceof HTMLButtonElement) {

            mixpanel.trackEvent('popupBtnClicked', { 
                btnId: event.originalTarget.id ,
                text: event.originalTarget.textContent,
            });
        }
    });
}
