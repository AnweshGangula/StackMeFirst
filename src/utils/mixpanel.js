// Not working with MS Edge right now

import mixpanel from 'mixpanel-browser';

export default class SmfMixpanel {
    constructor(token = "", pageView = false) {
        this.token = token;
        this.token = "3dd982c60bba9559c0f2f428769f59b4";

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