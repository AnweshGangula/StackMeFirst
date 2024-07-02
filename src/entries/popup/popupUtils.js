import browser from "webextension-polyfill";
import { toast } from '@zerodevx/svelte-toast'

import scrollToTarget from "../executeScript/executeScript";
import { IsQuestion } from "~/utils/utils";
import { defaultPreferances, pageTypeEnum } from "~/utils/constants";
import logo from "~/assets/logo.svg";
const logoImageUrl = new URL(logo, import.meta.url).href;

const manifestVer = Number(import.meta.env.VITE_MANIFEST_VERSION);
export default function ExecuteScroll(tabId, eleId, type, offsetHeight, pageType = null) {
    if (pageType == pageTypeEnum.sidebar) {
        scrollToTarget(eleId, type, offsetHeight + 10);
    }else if (manifestVer == 3) {
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
    browser.storage.sync.get({ stackMeData: defaultPreferances }).then(function (result) {
        // You can set default for values not in the storage by providing a dictionary:
        // reference: https://stackoverflow.com/a/26898749/6908282
        // if stackMeData is not found, use defaultPreferances for a first time user
        UpdateUI(result.stackMeData, pageType);
    });
}
export function UpdateUI(Options, pageType) {
    if (pageType == pageTypeEnum.sidebar) return;

    document.getElementById("hlAnswers").checked = Options.hlAns;
    document.getElementById("srtAns").checked = Options.srtAns;
    document.getElementById("hlComments").checked = Options.hlCmnts;
    document.getElementById("hlLinkQs").checked = Options.hlLinkQs;
    document.getElementById("displaySidebar").checked = Options.displaySidebar;
    document.getElementById("dockSidebar").checked = Options.dockSidebar;

    if (pageType == pageTypeEnum.popup) {
        const ansList = document.getElementById("answerList");
        const ansOff = document.getElementById("answerOff");
        const cmtList = document.getElementById("commentList");
        const cmtOff = document.getElementById("commentOff");
        const linkOff = document.getElementById("linkqOff");

        if (!Options.hlAns) {
            const msg = "highlighting answers is disabled";
            ansList.title = msg;
            ansOff.textContent = msg;
            document.getElementById("answerCount").textContent = "?";
        } else {
            ansList.title = "";
            ansOff.textContent = "";
        }

        if (!Options.hlCmnts) {
            const msg = "highlighting comments is disabled";
            cmtList.title = msg;
            cmtOff.textContent = msg;
            document.getElementById("commentCount").textContent = "?";
        } else {
            cmtList.title = "";
            cmtOff.textContent = "";
        }

        if (linkOff) {
            if (!Options.hlLinkQs) {
                const msg = "highlighting Links is disabled";
                linkOff.textContent = msg;
            } else {
                linkOff.textContent = "";
            }
        }
    }
}

// Update the relevant fields with the new data.
export function CheckWarnings(currTab, info) {
    let warningText = "";
    let warningType = new Set();
    const isQuestion = currTab == pageTypeEnum.sidebar ? true : IsQuestion(currTab.url) ; // always true for contentscript

    //  reference: https://stackoverflow.com/a/20023723/6908282
    const metaData = info.metaData;
    if (!info.userLoggedIn){ // } && !info.userInCommunity) {
        warningText = "! Login to Stack Overflow to highlight your answers";
        warningType.add("warn");
    } else if (!info.userInCommunity) {
        warningText = "! Join this Community to use Stack Me First Plugin";
        warningType.add("warn");
    } else if (!isQuestion) {
        warningText = "! Please open any Stack Exchange question to use this addin.";
        warningType.add("warn");
    } else if ((info.commentList == undefined || info.commentList.length == 0) && (info.answerList == undefined || info.answerList.length == 0)) {
        warningText = "! This question doesn't have any answers/comments submitted by you.";
        warningType.add("warn");
    }

    if ((metaData.currUser && metaData.quesAuthor) && metaData.currUser == metaData.quesAuthor) {
        // warningText = "";
        warningType.add("notify_author");
    }
    const output = { warningText, warningType }
    return output;
}


export function DisplayToast(toastContent) {
    const toastHTMLContent = toastContent.startsWith("<") ? toastContent :`<div>${toastContent}</div>`
    toast.push(
        `
        <div class="toastContent" style="display: flex;align-items: center;gap: 3px;">
            <a href="https://github.com/AnweshGangula/StackMeFirst" rel="nofollow" target="_blank">
                <img src=${logoImageUrl} height="23" alt="Stack Me First Logo" />
            </a>
            ${toastHTMLContent}
            <a href="https://github.com/AnweshGangula/StackMeFirst?tab=readme-ov-file#advanced-features-with-login" rel="nofollow" target="_blank" 
            style="
                color: white;
                margin: auto;
                text-decoration: none;
                padding: 2px 8px;
                background: firebrick;
                border-radius: 100vh;
            ">
                ?
            </a>
        </div>
        `
        , {
            // // Effectively disables autoclose when `initial`==`next`
            pausable: true,
            classes: ["SMFToast"],
            // initial: 0
        }
    );
}
