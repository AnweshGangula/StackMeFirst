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

async function displayHTML() {
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
            chrome.action.getBadgeText({ tabId: activeTab.id }, badgeText => {
                // https://stackoverflow.com/a/73178480/6908282
                if (badgeText == "" || badgeText == "0A0C" || !URLpathname.startsWith("/questions")) {
                    DisplayNotificaction("! This question doesn't have any answers/comments submitted by you.");
                }
                if (badgeText == "Login") {
                    DisplayNotificaction("! Login to Stack Overflow to highlight your answers");
                }
            });

            chrome.tabs.sendMessage(
                activeTab.id,
                { from: 'popup', subject: 'popupDOM' },
                // ...also specifying a callback to be called
                //    from the receiving end (content script).
                SetPopupContent);
            // if (website != "stackoverflow.com" || website != "extensions") {
            // // commenting this because the options page is not working as expected in edge://extensions/ page
            //     console.log(website);
            //     document.getElementById("config").style.display = "none";
            // }
        }
        else {
            DisplayNotificaction("! Please Open a Stack Overflow website to use this addin.");
        }
    });

}

// Update the relevant fields with the new data.
const SetPopupContent = info => {
    //  reference: https://stackoverflow.com/a/20023723/6908282
    let answerList = info.answerList;
    let commentList = info.commentList;
    let answerDOM = document.getElementById('ansList');
    let ansCount = document.getElementById('ansCount');
    let commDOM = document.getElementById('commList');
    let commCount = document.getElementById('commCount');

    if (answerList !== "N/A") {
        ansCount.textContent = answerList.length;
        answerDOM.appendChild(MyStackLinks(answerList, "answer"));
    }

    if (commentList !== "N/A") {
        commCount.textContent = commentList.length;
        commDOM.appendChild(MyStackLinks(commentList, "comment"));
    }

};

function MyStackLinks(eleList, type) {
    let myContent = document.createElement("ul");
    let offsetHeight = document.getElementsByTagName('header')[0].offsetHeight

    eleList.forEach(eleID => {
        let ansEle = document.createElement("li");
        let link = document.createElement("a");
        link.textContent = eleID;
        chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
            let activeTab = activeTabs[0];
            let activeURL = new URL(activeTab.url);
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
                //  reference: https://stackoverflow.com/a/38579393/6908282
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id, allFrames: true },
                    args: [eleID, type, offsetHeight + 10],
                    func: scrollToTarget
                });
            });
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
    }

    if (!Options.hlCmnts) {
        const msg = "highlighting comments is disabled"
        document.getElementById('commList').title = msg;
        document.getElementById("commOff").textContent = msg;
    }
}

function DisplayNotificaction(warningText) {
    if (warningText == "") {
        document.getElementById("notification").style.display = "none";
    } else {
        document.getElementById("notification").style.display = "block"
        document.getElementById("notification").textContent = warningText;
    }
}

function scrollToTarget(eleId, type, headerHeight = 40) {
    // reference: https://stackoverflow.com/a/67647864/6908282
    // this function is being used in popupjs for sctoll to the answer/comment clicked dby the user
    let element = document.getElementById(eleId);
    element.classList.add("highlighted-post"); // CSS class 'highlighted-post' has a animation called 

    if (type == "comment") {
        element = document.getElementById(eleId).getElementsByClassName("comment-text")[0];
        element.style.backgroundColor = 'var(--yellow-100)' // comments have a transition for backgroundColor. So settimeout to remove backgroundcolor triggers that's transition
    }
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition - headerHeight;

    window.scrollBy({
        top: offsetPosition,
        behavior: "smooth"
    });

    setTimeout(function () {
        element.classList.remove("highlighted-post");
        element.style.backgroundColor = ''
    }, 3000);
}
