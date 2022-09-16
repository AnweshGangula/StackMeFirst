import browser from "webextension-polyfill";

import scrollToTarget from "../executeScript/executeScript";
import { IsQuestion } from "~/utils/utils";

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
        // You can set default for values not in the storage by providing a dictionary:
        // reference: https://stackoverflow.com/a/26898749/6908282
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
            document.getElementById("answerList").title = msg;
            document.getElementById("answerOff").textContent = msg;
            document.getElementById("answerCount").textContent = "?";
        } else {
            document.getElementById("answerList").title = "";
            document.getElementById("answerOff").textContent = "";
        }

        if (!Options.hlCmnts) {
            const msg = "highlighting comments is disabled";
            document.getElementById("commentList").title = msg;
            document.getElementById("commentOff").textContent = msg;
            document.getElementById("commentCount").textContent = "?";
        } else {
            document.getElementById("commentList").title = "";
            document.getElementById("commentOff").textContent = "";
        }
    }
}

// Update the relevant fields with the new data.
export function CheckWarnings(currTab, info) {
    let warningText = "";
    let warningType = new Set();
    const isQuestion = IsQuestion(currTab.url);

    //  reference: https://stackoverflow.com/a/20023723/6908282
    const metaData = info.metaData;
    if (metaData.currUser == undefined) {
        warningText = "! Login to Stack Overflow to highlight your answers";
        warningType.add("warn");
    } else if (!isQuestion) {
        warningText = "! Please open a Stack Overflow question to use this addin.";
        warningType.add("warn");
    } else if ((info.commentList == undefined || info.commentList.length == 0) && (info.answerList == undefined || info.answerList.length == 0)) {
        warningText = "! This question doesn't have any answers/comments submitted by you.";
        warningType.add("warn");
    }

    if (metaData.currUser == metaData.quesAuthor) {
        // warningText = "";
        warningType.add("notify_author");
    }
    const output = { warningText, warningType }
    return output;
}
