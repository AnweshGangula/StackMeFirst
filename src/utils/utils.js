import browser from "webextension-polyfill";
import { ignoreUrlList, defaultApiData, stackCommunities } from "./constants";
export async function GetLocalTokenData() {
    let tokenData = false;
    tokenData = await browser.storage.sync.get({ apiData: defaultApiData }).then(async function (result) {
        let localTokenData = result.apiData;
        return localTokenData;
    });

    return tokenData
}

function getDomainWithoutSubdomain(url) {
    const urlParts = new URL(url).hostname.split('.')

    return urlParts
        .slice(0)
        .slice(-2)
        .join('.')
}


export function IsStackOverflow(baseUrl) {
    // let activeURL = new URL(baseUrl);
    // let website = activeURL.host;
    // const isStackOverflow = website == "stackoverflow.com";

    const isStackOverflow = stackCommunities.includes(getDomainWithoutSubdomain(baseUrl));
    return isStackOverflow
}
export function IsQuestion(baseUrl) {
    let activeURL = new URL(baseUrl);
    let URLpathname = activeURL.pathname;
    const ignoreURL = ignoreUrlList.some((url) => URLpathname.includes(url))
    const isQuestion = URLpathname.startsWith("/questions/");

    return IsStackOverflow(baseUrl) && isQuestion && !ignoreURL
}

export function QuesIdUrl(baseUrl) {

    const activeURL = new URL(baseUrl);
    const quesId = activeURL.pathname.replace("/questions/", "").split("/")[0];

    return quesId
}

export function BaseUrl(baseUrl) {
    // ref: https://stackoverflow.com/a/6257480/6908282

    let activeURL = new URL(baseUrl);
    const baseURL = activeURL.protocol + "//" + activeURL.host + activeURL.pathname;

    return baseURL
}

export function LinkToComment(baseUrl, eleId) {
    const quesId = QuesIdUrl(baseUrl);
    const linkToComment = BaseUrl(baseUrl) + "#" + eleId.replace("-", "") + "_" + quesId;

    return linkToComment;
}

export function LinkToAnswer(baseUrl, eleId) {
    const ansId = eleId.replace("answer-", "");
    const linkToAnswer = BaseUrl(baseUrl) + "/" + ansId + "#" + ansId;

    return linkToAnswer;
}

export function LinkToLinkQ(baseUrl, eleId) {
    // const href = BaseUrl(baseUrl) + "/q/" + eleId + "?lq=1"
    let activeURL = new URL(baseUrl);
    const baseURL = activeURL.protocol + "//" + activeURL.host + "/questions/";

    const href = baseURL + eleId;

    return href;
}

export function GetBrowser() {
    var test = function (regexp) { return regexp.test(navigator.userAgent) }
    switch (true) {
        case test(/edg/i): return "Microsoft Edge";
        case test(/trident/i): return "Microsoft Internet Explorer";
        case test(/firefox|fxios/i): return "Mozilla Firefox";
        case test(/opr\//i): return "Opera";
        case test(/ucbrowser/i): return "UC Browser";
        case test(/samsungbrowser/i): return "Samsung Browser";
        case test(/chrome|chromium|crios/i): return "Google Chrome";
        case test(/safari/i): return "Apple Safari";
        default: return "Other";
    }
};
