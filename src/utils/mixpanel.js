// mixpanel project link: https://mixpanel.com/project/2794687/app/settings#project/2794687

import mixpanel from 'mixpanel-browser';
import { devModeSuffix } from './constants';
import { devConsole } from './utils';

const devMixpanel = "3dd982c60bba9559c0f2f428769f59b4";
const prodMixPanel = "5280502e9fa283137f3707add408d7d2";

export default class SmfMixpanel {
    currToken = import.meta.env.VITE_DEV_MODE == "true" ? devMixpanel : prodMixPanel; // prodMixPanel;

    constructor(pageViewData = undefined) {
        // this.token = token;
        this.token = this.currToken;

        this.init();
        if(pageViewData){
            this.trackPageView(pageViewData);
        }
    }

    init() {
        mixpanel.init(this.token, {
            // debug mode doesn't send data - it logs the data in dev console in browser
            // https://docs.mixpanel.com/docs/tracking/reference/javascript#debug-mode

            debug: false,
            track_pageview: false,
            persistence: 'localStorage'
        });
    }

    testTrack() {
        console.log("testing mixpanel");
        mixpanel.track('Test', {
            'TestKey': 'TestValue'
        })
    }

    trackEvent(name, keyValueData = {}) {
        // console.log("tracking event", {name}, {keyValueData});
        const nameSuffix = import.meta.env.VITE_DEV_MODE == "true" ? devModeSuffix : "";
        name += nameSuffix;

        devConsole("final Mixpanel call", name, keyValueData); // use mixpanel.init{debug: true} instead

        mixpanel.track(name, keyValueData);
    }

    trackPageView(data){
        if(import.meta.env.VITE_DEV_MODE == "true"){
            data.devMode = true;
        }

        mixpanel.track_pageview(data);
    }
}