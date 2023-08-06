import SmfMixpanel from "~/utils/mixpanel";

const mixpanel = new SmfMixpanel();

export default function DockMixpanel(event) {
    if (event.originalTarget instanceof HTMLButtonElement) {
        mixpanel.trackEvent('dockBtnClicked', { 
            btnId: event.originalTarget.id ,
            text: event.originalTarget.textContent,
         });
    }
}