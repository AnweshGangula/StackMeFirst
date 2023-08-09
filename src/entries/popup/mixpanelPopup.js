import browser from "webextension-polyfill";
import { pageTypeEnum } from "~/utils/constants";
import SmfMixpanel from "~/utils/mixpanel";
import { getUrlRootDomain } from "~/utils/utils";

export default function popupMixpanel() {
    window.addEventListener('load', () => {
        // pageView event is fired by default since we passed `track_pageview: true,`
        // mixpanel.trackEvent(document.title, document.location.href);

        
        browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
            
            // get current Tab - https://stackoverflow.com/a/29151677/6908282
            let activeTab = tabs[0];
            const website = getUrlRootDomain(activeTab.url);
            
            const pageViewData = {
                website,
                pageType: pageTypeEnum.popup
            };
            const mixpanel = new SmfMixpanel(pageViewData);
        })
    });

    // Listen globally for all button events
    document.addEventListener('click', (event) => {

        if (event.target instanceof HTMLButtonElement) {

            // mixpanel.trackEvent('popupBtnClicked', { 
            //     btnId: event.target.id ,
            //     text: event.target.textContent,
            // });

            browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {

                // get current Tab - https://stackoverflow.com/a/29151677/6908282
                let activeTab = tabs[0];
                const website = getUrlRootDomain(activeTab.url);
    
                browser.runtime.sendMessage({
                    //  reference: https://stackoverflow.com/a/20021813/6908282
                    from: "popup",
                    subject: "sendMixPanelData",
                    eventName: 'btnClicked',
                    content: {
                        website,
                        pageType: pageTypeEnum.popup,
                        btnId: event.target.id,
                        text: event.target.textContent,
                    }
                }).then(function () {
                    // console.log("sending message");
                });
            })
		
        }
    });
}

export function backlinkMixpanel(pageType, backlinkType, backlinkId){
    // this is used in StackContent component - which is used in popup and contentScript - so 
    // we need to know which one is calling it

    // const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true })

    let website = "smfCheckingWebsite...";
    const message = {
        //  reference: https://stackoverflow.com/a/20021813/6908282
        from: pageType,
        subject: "sendMixPanelData",
        eventName: 'backlinkClicked',
        content: {
            website,
            pageType,
            backlinkType,
            backlinkId,
        }
    }

    if(pageType === pageTypeEnum.popup){

        browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
            // get current Tab - https://stackoverflow.com/a/29151677/6908282
            let activeTab = tabs[0];
            message.content.website = getUrlRootDomain(activeTab.url);
        
            browser.runtime.sendMessage(message).then(function () {
                // console.log("sending backlink to mixpanel");
            });
        })
    }else{
        message.content.website = getUrlRootDomain(window.location.href);

        browser.runtime.sendMessage(message).then(function () {
            // console.log("sending backlink to mixpanel");
        });
    }

		
}
