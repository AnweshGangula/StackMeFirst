import { ignoreUrlList } from "./constants";

export function IsStackOverflow(baseUrl) {
    let activeURL = new URL(baseUrl);
    let website = activeURL.host;
    const isStackOverflow = website == "stackoverflow.com";

    return isStackOverflow
}
export function IsQuestion(baseUrl) {
    let activeURL = new URL(baseUrl);
    let URLpathname = activeURL.pathname;
    const ignoreURL = ignoreUrlList.some((url) => URLpathname.includes(url))
    const isQuestion = URLpathname.startsWith("/questions/");

    return isQuestion && !ignoreURL
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