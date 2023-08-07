import SmfMixpanel from "~/utils/mixpanel";

const mixpanel = new SmfMixpanel();

export default function DockMixpanel(event) {
    console.log("sending mixpanel event", event)
    if (event.target instanceof HTMLButtonElement) {
        mixpanel.trackEvent('dockBtnClicked', { 
            btnId: event.target.id ,
            text: event.target.textContent,
         });
    }
}