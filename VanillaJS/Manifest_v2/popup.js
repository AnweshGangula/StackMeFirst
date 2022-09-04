// chrome.storage.sync.clear(); // use this while development to clear any existing options
// let console = chrome.extension.getBackgroundPage().console;

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', () => {
    displayHTML();
    document.getElementById('btnSave').addEventListener('click', save_options);
    document.getElementById('btnReset').addEventListener('click', reset_options);
})

let defaultOptions = {
    hlAns: true,
    srtAns: true,
    hlCmnts: false,
}

function displayHTML() {
    restore_options();

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        // get current Tab - https://stackoverflow.com/a/29151677/6908282
        let activeTab = tabs[0];
        let activeURL = new URL(activeTab.url)
        let currURL = activeURL.href // .at(-1)
        let website = activeURL.host;
        let URLpathname = activeURL.pathname;
        const isStackOverflow = website == "stackoverflow.com"
        if (isStackOverflow) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { from: 'popup', subject: 'popupDOM' },
                // ...also specifying a callback to be called
                //    from the receiving end (content script).
                (info) => {
                    SetPopupContent(tabs[0], info);
                });
            // if (website != "stackoverflow.com" || website != "extensions") {
            // // commenting this because the options page is not working as expected in edge://extensions/ page
            //     console.log(website);
            //     document.getElementById("config").style.display = "none";
            // }
        } else {
            DisplayNotificaction("! Please Open a Stack Overflow website to use this addin.");
        }
    });

}

// Update the relevant fields with the new data.
function SetPopupContent(currTab, info) {
    //  reference: https://stackoverflow.com/a/20023723/6908282
    const metaData = info.metaData;
    if (metaData.currUser == undefined) {
        DisplayNotificaction("! Login to Stack Overflow to highlight your answers", "warn");
        return;
    }

    if (info.commentList.length == 0 && info.answerList.length == 0) {
        DisplayNotificaction("! This question doesn't have any answers/comments submitted by you.", "warn");
        return;
    }

    if (metaData.currUser == metaData.quesAuthor) {
        DisplayNotificaction("You are the author of this question.", "notify");
    }

    let answerList = info.answerList;
    let commentList = info.commentList;
    let answerDOM = document.getElementById('ansList');
    let ansCount = document.getElementById('ansCount');
    let commDOM = document.getElementById('commList');
    let commCount = document.getElementById('commCount');

    if (answerList !== "N/A") {
        ansCount.textContent = answerList.length;
        answerDOM.appendChild(MyStackLinks(answerList, "answer", currTab));
    }

    if (commentList !== "N/A") {
        commCount.textContent = commentList.length;
        commDOM.appendChild(MyStackLinks(commentList, "comment", currTab));
    }
};

function MyStackLinks(eleList, type, tab) {
    let myContent = document.createElement("ul");
    let offsetHeight = document.getElementsByTagName('header')[0].offsetHeight

    eleList.forEach(eleID => {
        let ansEle = document.createElement("li");
        let link = document.createElement("a");
        link.textContent = eleID;

        let activeURL = new URL(tab.url);
        let linkRef = '';
        if (type == "comment") {
            linkRef = activeURL.href + eleID;
        }
        if (type == "answer") {
            const ref = eleID.replace("answer-", "");
            linkRef = activeURL.href + "/" + ref + "#" + ref
        }
        link.setAttribute('href', linkRef);
        link.addEventListener('click', function () {
            window.event.preventDefault();
            ExecuteScroll(tab.id, eleID, type, offsetHeight);
        });

        ansEle.appendChild(link);
        myContent.appendChild(ansEle);
    });

    return myContent;
}

// Saves options to chrome.storage
// https://developer.chrome.com/docs/extensions/mv3/options/
async function save_options() {
    const hlAnswers = document.getElementById('hlAnswers').checked;
    const srtAns = document.getElementById('srtAns').checked;
    const hlComments = document.getElementById('hlComments').checked;
    let stackMeData = {
        hlAns: hlAnswers,
        srtAns: srtAns,
        hlCmnts: hlComments,
    }
    chrome.storage.sync.set({ stackMeData: stackMeData }, function () {
        UpdateStatus("Options Saved");
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // https://developer.chrome.com/docs/extensions/mv3/options/
    chrome.storage.sync.get({ 'stackMeData': defaultOptions }, result => {
        // if stackMeData is not found, use defaultOptions for a first time user
        UpdateUI(result.stackMeData)
    });
}

async function reset_options() {
    chrome.storage.sync.set({ stackMeData: defaultOptions }, () => {
        // reset to defaultOptions
        UpdateUI(defaultOptions)
    });

    UpdateStatus("Options reset");
    restore_options;
}

function UpdateStatus(statusText) {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = statusText + " - Please reload the tab for accurate behaviour";
    status.style.visibility = "visible";
    setTimeout(function () {
        status.style.visibility = "hidden";
    }, 5000);
}

function UpdateUI(Options) {
    document.getElementById('hlAnswers').checked = Options.hlAns;
    document.getElementById('srtAns').checked = Options.srtAns;
    document.getElementById('hlComments').checked = Options.hlCmnts;

    if (!Options.hlAns) {
        const msg = "highlighting answers is disabled"
        document.getElementById('ansList').title = msg;
        document.getElementById("ansOff").textContent = msg;
        document.getElementById('ansCount').textContent = "?";
    }

    if (!Options.hlCmnts) {
        const msg = "highlighting comments is disabled"
        document.getElementById('commList').title = msg;
        document.getElementById("commOff").textContent = msg;
        document.getElementById('commCount').textContent = "?";
    }
}

function DisplayNotificaction(warningText, type) {

    let notifyEle = document.getElementById("notification")
    let bgColor, txtColor;
    if (type == "warn") {
        bgColor = "mistyrose";
        txtColor = "firebrick"
    } else if (type == "notify") {
        bgColor = "palegreen";
        txtColor = "darkgreen"
    }

    if (warningText == "") {
        notifyEle.style.display = "none";
    } else {
        notifyEle.textContent = warningText;
        notifyEle.style.cssText = `
            display: block; 
            background-color: ${bgColor};
            color: ${txtColor};
            border-color: ${txtColor};
        `
    }
}

function ExecuteScroll(tabId, eleID, type, offsetHeight) {
    //  reference: https://stackoverflow.com/a/73597865/6908282
    chrome.tabs.executeScript(tabId, { file: './executeScript.js' }, () => {
        chrome.tabs.executeScript(tabId, {
            allFrames: false,
            code: "scrollToTarget('" + eleID + "', '" + type + "', '" + offsetHeight + "'); ",
        });
    });
    //  old reference for code : https://stackoverflow.com/a/38579393/6908282
}
