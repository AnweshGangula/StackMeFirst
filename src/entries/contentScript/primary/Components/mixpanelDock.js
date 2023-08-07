import SmfMixpanel, {httpTrackEvent} from "~/utils/mixpanel";

const mixpanel = new SmfMixpanel();

export default function DockMixpanel(event) {
    console.log("sending mixpanel data from Dock")
    if (event.originalTarget instanceof HTMLButtonElement) {
        httpTrackEvent('dockBtnClicked', { 
            btnId: event.originalTarget.id ,
            text: event.originalTarget.textContent,
         });
    }
}