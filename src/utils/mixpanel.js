// Not working with MS Edge right now
// mixpanel project link: https://mixpanel.com/project/2794687/app/settings#project/2794687

import mixpanel from 'mixpanel-browser';

const devMixpanel = "3dd982c60bba9559c0f2f428769f59b4";
const prodMixPanel = "5280502e9fa283137f3707add408d7d2";

export default class SmfMixpanel {
    constructor(token = "", pageView = false) {
        this.token = token;
        this.token = prodMixPanel; // devMixpanel;

        this.init(pageView);
    }

    init(pageView) {
        mixpanel.init(this.token, {
            debug: false,
            track_pageview: pageView,
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
        console.log("tracking event", {name}, {keyValueData});
        mixpanel.track(name, keyValueData);
    }
}