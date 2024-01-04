import browser from "webextension-polyfill";
import { customFilterEg, StackAppDetails } from "./constants";
import { GetBrowser } from "./utils";

// reference: https://github.com/GanguLabs/StackFave/blob/master/src/utils/api.js

const baseURL = 'https://api.stackexchange.com/2.3';

const currBrowser = GetBrowser();
let apiKey;
if (currBrowser == "Mozilla Firefox") {
    apiKey = StackAppDetails.firefox.key;
} else {
    apiKey = StackAppDetails.chromium.key;
}

// generated from createFilter method
const filter = '!0XXAMzZV3)6nNHjQ18538kAUL';

export default class Api {
    constructor(token) {
        this.token = token;
    }

    static auth(sendResponse) {
        let clientId;

        if (currBrowser == "Mozilla Firefox") {
            clientId = StackAppDetails.firefox.clientId;
        } else {
            clientId = StackAppDetails.chromium.clientId;
        }

        const scope = 'read_inbox,no_expiry,private_info';
        const redirectUrl = browser.identity.getRedirectURL('oauth2');
        const url = `https://stackoverflow.com/oauth/dialog?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUrl}`;
        browser.identity.launchWebAuthFlow(
            { url: url, interactive: true }).then(
                redirect_url => {
                    const token = redirect_url.match(/access_token=(.+)/)[1];
                    sendResponse({ token });
                }
            );
    }

    _buildURL(endpoint, queriesObj, site) {
        // if endpoint == "/sites" - the API call is just to fetch the Stack exchange sites
        // it doesn't have any query params
        
        const query = endpoint == "/sites" ? "" : `?${this._objToQuery({
            key: apiKey,
            access_token: this.token,
            ...(site && { site }),
            ...queriesObj,
        })}`;
        const url = encodeURI(`${baseURL}${endpoint}${query}`);
        return url;
    }

    _objToQuery(obj = {}) {
        const entries = Object.entries(obj);
        if (entries.length === 0) {
            return '';
        }
        return entries.map(([key, val]) => `${key}=${val}`).join('&');
    }

    async _fetch(endpoint, queriesObj = {}, site = 'stackoverflow') {
        const url = this._buildURL(endpoint, queriesObj, site);
        const res = await fetch(url);
        return await res.json();
    }

    // used during development to generate filter
    async _createFilter(filterOpts = customFilterEg) {
        const includeFeilds = filterOpts.includeFeilds;
        const excludeFeilds = filterOpts.excludeFeilds;
        const { items } = await this._fetch(
            '/filters/create',
            {
                include: includeFeilds.join(';'),
                exclude: excludeFeilds.join(';'),
                base: filterOpts.base,
                unsafe: false,
            },
            ''
        );
        if (items.length === 0) {
            return '';
        }
        // console.log(items);
        const filterName = items[0].filter;
        return filterName;
    }

    async getFavorites(queriesObj = {}) {
        let favorites = [];
        let hasMore = false;
        const mergedQuery = Object.assign({ page: 1, filter }, queriesObj);
        do {
            if (hasMore) {
                mergedQuery.page += 1;
            }
            const { items, has_more } = await this._fetch(
                '/me/favorites',
                mergedQuery
            );
            favorites = favorites.concat(items);
            hasMore = has_more;
        } while (hasMore);
        return favorites;
    }

    async getMyDetails(queriesObj = {}) {
        let myDetails = [];
        let hasMore = false;
        const mergedQuery = Object.assign({ page: 1, filter }, queriesObj);
        do {
            if (hasMore) {
                mergedQuery.page += 1;
            }
            const { items, has_more } = await this._fetch(
                '/me',
                mergedQuery
            );
            myDetails = myDetails.concat(items);
            hasMore = has_more;
        } while (hasMore);
        return myDetails;
    }

    async getAnswers(currURL, ids, queriesObj = {}) {
        const site = await this.siteNameFromURL(currURL); //.split(".")[0];

        const filter = this.token ? "!*Mg4PjfvuWMFghsH" : "withbody";
        // queriesObj.filter = "withbody"; // https://stackoverflow.com/a/69166789/6908282
        if (!("pagesize" in queriesObj)) {
            queriesObj.pagesize = 100;
            // 100 is the max pagesize - https://api.stackexchange.com/docs/paging
        }
        let myDetails = [];
        let hasMore = false;
        const mergedQuery = Object.assign({ page: 1, filter }, queriesObj);
        do {
            if (hasMore) {
                mergedQuery.page += 1;
            }
            const { items, has_more } = await this._fetch(
                `/questions/${ids}/answers`,
                mergedQuery,
                site
            );
            myDetails = myDetails.concat(items);
            hasMore = has_more;
        } while (hasMore);
        return myDetails;
    }

    async getComments(currURL, ids, queriesObj = {}) {
        const site = await this.siteNameFromURL(currURL); //.split(".")[0];

        queriesObj.filter = "withbody"; // https://stackoverflow.com/a/69166789/6908282
        if (!("pagesize" in queriesObj)) {
            queriesObj.pagesize = 100;
            // 100 is the max pagesize - https://api.stackexchange.com/docs/paging
        }

        let myDetails = [];
        let hasMore = false;
        const mergedQuery = Object.assign({ page: 1, filter }, queriesObj);
        do {
            if (hasMore) {
                mergedQuery.page += 1;
            }
            const { items, has_more } = await this._fetch(
                `/posts/${ids}/comments`,
                mergedQuery,
                site
            );
            myDetails = myDetails.concat(items);
            hasMore = has_more;
        } while (hasMore);
        // console.log({myDetails})
        return myDetails;
    }

    async getLinkedQues(currURL, ids, queriesObj = {}) {
        const site = await this.siteNameFromURL(currURL); //.split(".")[0]

        const filter = "!IF6sbADh-1NFXRL_9Gd7_0XJ2-(Ng*6BJ2aPkdHx6rDtBZ-"
        // Checkk filter options here: https://api.stackexchange.com/docs/read-filter#filters=!gA._5vuQCU1LfxLMryEA8lClXXUw*bEruKr&filter=default&run=true

        if (!("pagesize" in queriesObj)) {
            queriesObj.pagesize = 100;
            // 100 is the max pagesize - https://api.stackexchange.com/docs/paging
        }

        let myDetails = [];
        let hasMore = false;
        const mergedQuery = Object.assign({ page: 1, filter }, queriesObj);
        let allowPagination = true;
        do {
            if (hasMore) {
                mergedQuery.page += 1;
            }
            const { items, has_more } = await this._fetch(
                `/questions/${ids}/linked`,
                mergedQuery,
                site
            );
            myDetails = myDetails.concat(items);
            hasMore = has_more;

            //pagination not working if more than 100 links - https://meta.stackexchange.com/q/307314/381523
            allowPagination = false;
        } while (hasMore && allowPagination);
        return myDetails;
    }

    async siteNameFromURL(url) {
        const stackExchangeSites = await this._fetch(
            `/sites`,
            {},
            undefined
        );
        
        const stackExchangeSitesNames = new Map();;
        stackExchangeSites.items.map(site => {
            const key = new URL(site.site_url).host;
            stackExchangeSitesNames.set(key, site.api_site_parameter)
        });
        // console.log({stackExchangeSitesNames})

        return stackExchangeSitesNames.get(new URL(url).host);
    }

}
