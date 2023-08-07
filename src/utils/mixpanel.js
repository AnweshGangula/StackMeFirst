// Not working with MS Edge right now
// mixpanel project link: https://mixpanel.com/project/2794687/app/settings#project/2794687

import mixpanel from 'mixpanel-browser';
import axios from 'axios';

const devMixpanel = "3dd982c60bba9559c0f2f428769f59b4";
const prodMixPanel = "5280502e9fa283137f3707add408d7d2";

const currToken = devMixpanel; // prodMixPanel;

export default class SmfMixpanel {
    constructor(token = "", pageView = false) {
        this.token = token;
        this.token = currToken;

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
        console.log("tracking event", { name }, { keyValueData });
        mixpanel.track(name, keyValueData);
    }
}

export function httpTrackEvent(name, keyValueData = {}) {
    keyValueData.token = currToken;
    const options = {
        method: 'POST',
        url: 'https://api.mixpanel.com/track',
        headers: { accept: 'text/plain', 'content-type': 'application/json' },
        data: [
            {
                event: name,
                properties: keyValueData,
            }
        ]
    };

    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.error(error);
        });
}