// ref: https://segment.com/docs/connections/sources/catalog/libraries/server/node/

import { Analytics } from '@segment/analytics-node'
import browser from "webextension-polyfill";

// instantiation
const analytics = new Analytics({ writeKey: 'hpV8OHsQBgPs9c46bBCEZJvw3P7Mlq0H' });

async function getOrCreateClientId() {
    try {

        // Stack Me First Segment User ID to map multiple events to a single user
        let { smfSegmentAnonymousId } = await browser.storage.local.get('smfSegmentAnonymousId');
        if (!smfSegmentAnonymousId) {
            // Generate a unique client ID, the actual value is not relevant
            smfSegmentAnonymousId = self.crypto.randomUUID();
            await browser.storage.local.set({ smfSegmentAnonymousId });
        }
        return smfSegmentAnonymousId;

    } catch (error) {
        console.log({ error })
    }
}

export function segmentTrackEvent(eventName, properties) {
    const analytics = new Analytics({ writeKey: 'hpV8OHsQBgPs9c46bBCEZJvw3P7Mlq0H' });
    analytics.on('error', (err) => console.error(err))

    analytics.track({
        anonymousId: '48d213bb-95c3-4f8d-af97-86b2b404dcfe', // TODO: use getOrCreateClientId
        event: 'SMF Segment Test ' + eventName,
        properties
    });

}
