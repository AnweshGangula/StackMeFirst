import mixpanel from 'mixpanel-browser';

export default class SmfMixpanel {
    constructor(token) {
        this.token = token;
        this.token = "3dd982c60bba9559c0f2f428769f59b4";

        this.init();
    }

    init() {
        mixpanel.init(this.token, {
            debug: true,
            track_pageview: true,
            persistence: 'localStorage'
        });
    }

    testTrack() {
        console.log("testing mixpanel");
        mixpanel.track('Test', {
            'TestKey': 'TestValue'
        })
    }

    trackEvents(name, data) {
        mixpanel.track(name, data);
    }
}