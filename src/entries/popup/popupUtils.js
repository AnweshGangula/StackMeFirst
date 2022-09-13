import browser from "webextension-polyfill";
import scrollToTarget from "../executeScript/executeScript";

const manifestVer = Number(import.meta.env.VITE_MANIFEST_VERSION);
export const defaultOptions = {
    hlAns: true,
    srtAns: true,
    hlCmnts: false,
};

export default function ExecuteScroll(tabId, eleId, type, offsetHeight) {
    if (manifestVer == 3) {
        //  reference: https://stackoverflow.com/a/70932186/6908282
        browser.scripting.executeScript({
            target: { tabId: tabId, allFrames: false },
            args: [eleId, type, offsetHeight + 10],
            func: scrollToTarget,
        });
    } else {
        browser.tabs.executeScript(tabId, {
            // firefox not working with import function
            // solved by explosing scrollToTarget globally: https://stackoverflow.com/a/39383274/6908282
            // reference: https://stackoverflow.com/a/73599962/6908282
            allFrames: false,
            code: "window.scrollToTarget('" + eleId + "', '" + type + "', " + (offsetHeight + 10) + "); ",
        });
    }
}

// Restores select box and checkbox state using the preferences stored in browser.storage.
export function restore_options(pageType) {
    // https://developer.chrome.com/docs/extensions/mv3/options/
    browser.storage.sync.get({ stackMeData: defaultOptions }).then(function (result) {
        // if stackMeData is not found, use defaultOptions for a first time user
        UpdateUI(result.stackMeData, pageType);
    });
}
export function UpdateUI(Options, pageType) {
    document.getElementById("hlAnswers").checked = Options.hlAns;
    document.getElementById("srtAns").checked = Options.srtAns;
    document.getElementById("hlComments").checked = Options.hlCmnts;

    if (pageType == "popup") {
        if (!Options.hlAns) {
            const msg = "highlighting answers is disabled";
            document.getElementById("AnswerList").title = msg;
            document.getElementById("AnswerOff").textContent = msg;
            document.getElementById("AnswerCount").textContent = "?";
        } else {
            document.getElementById("AnswerList").title = "";
            document.getElementById("AnswerOff").textContent = "";
        }

        if (!Options.hlCmnts) {
            const msg = "highlighting comments is disabled";
            document.getElementById("CommentList").title = msg;
            document.getElementById("CommentOff").textContent = msg;
            document.getElementById("CommentCount").textContent = "?";
        } else {
            document.getElementById("CommentList").title = "";
            document.getElementById("CommentOff").textContent = "";
        }
    }
}