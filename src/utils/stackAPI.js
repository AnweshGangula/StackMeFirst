import { customFilterEg } from "./constants";

// reference: https://github.com/GanguLabs/StackFave/blob/master/src/utils/api.js

const baseURL = 'https://api.stackexchange.com/2.3';
const key = '1jY1xGKt)NGfZQwE3RbWHQ((';

// generated from createFilter method
const filter = '!0XXAMzZV3)6nNHjQ18538kAUL';

export default class Api {
    constructor(token) {
        this.token = token;
    }

    _buildURL(endpoint, queriesObj, site) {
        const query = `?${this._objToQuery({
            key,
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
        return fetch(url).then(res => {
            return res.json();
        });
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
        console.log(items);
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

    async getAnswers(ids, queriesObj = {}) {
        let myDetails = [];
        let hasMore = false;
        const mergedQuery = Object.assign({ page: 1, filter }, queriesObj);
        do {
            if (hasMore) {
                mergedQuery.page += 1;
            }
            const { items, has_more } = await this._fetch(
                `/questions/${ids}/answers`,
                mergedQuery
            );
            myDetails = myDetails.concat(items);
            hasMore = has_more;
        } while (hasMore);
        return myDetails;
    }

    async getComments(ids, queriesObj = {}) {
        let myDetails = [];
        let hasMore = false;
        const mergedQuery = Object.assign({ page: 1, filter }, queriesObj);
        do {
            if (hasMore) {
                mergedQuery.page += 1;
            }
            const { items, has_more } = await this._fetch(
                `/posts/${ids}/comments`,
                mergedQuery
            );
            myDetails = myDetails.concat(items);
            hasMore = has_more;
        } while (hasMore);
        return myDetails;
    }

    async getLinkedQues(ids, queriesObj = {}) {
        const filter = "!nKzQUQzHEe"
        let myDetails = [];
        let hasMore = false;
        const mergedQuery = Object.assign({ page: 1, filter }, queriesObj);
        do {
            if (hasMore) {
                mergedQuery.page += 1;
            }
            const { items, has_more } = await this._fetch(
                `/questions/${ids}/linked`,
                mergedQuery
            );
            myDetails = myDetails.concat(items);
            hasMore = has_more;
        } while (hasMore);
        return myDetails;
    }

}
