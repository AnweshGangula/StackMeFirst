let console = chrome.extension.getBackgroundPage().console;
let defaultOptions = {
    highlightComments: false,
    highlightLinkedQues: false,
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
        chrome.browserAction.getBadgeText({ tabId: activeTab.id }, badgeText => {
            // https://stackoverflow.com/a/73178480/6908282
            if (badgeText == "" || badgeText == "0A0C") {
                document.getElementById("notification").style.display = "block"
            }
        });
        if (website != "stackoverflow.com") {
            document.getElementById("config").style.display = "none";
        }
    });

}

// chrome.storage.sync.clear(); // use this while development to clear any existing options
document.addEventListener('DOMContentLoaded', displayHTML);
document.getElementById('btnSave').addEventListener('click', save_options);
document.getElementById('btnReset').addEventListener('click', reset_options);


// Saves options to chrome.storage
// https://developer.chrome.com/docs/extensions/mv3/options/
async function save_options() {
    var hlLinkedQs = document.getElementById('hlLinkedQs').checked;
    var hlComments = document.getElementById('hlComments').checked;
    let stackMeData = {
        highlightComments: hlComments,
        highlightLinkedQues: hlLinkedQs,
    }
    chrome.storage.sync.set({ stackMeData: stackMeData }, function () {
        UpdateStatus("Options Saved.");
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // https://developer.chrome.com/docs/extensions/mv3/options/
    chrome.storage.sync.get({ 'stackMeData': defaultOptions }, result => {
        // use defaultOptions for a first time user
        document.getElementById('hlComments').checked = result.stackMeData.highlightComments;
        document.getElementById('hlComments').value = result.stackMeData.highlightLinkedQues;
    });
}

async function reset_options() {
    chrome.storage.sync.set({ stackMeData: defaultOptions }, () => {
        // reset to defaultOptions
        document.getElementById('hlComments').checked = defaultOptions.highlightComments;
        document.getElementById('hlComments').value = defaultOptions.highlightLinkedQues;
    });

    UpdateStatus("Options reset.");
    restore_options;
}

function UpdateStatus(statusText) {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = statusText;
    status.style.visibility = "visible";
    setTimeout(function () {
        status.style.visibility = "hidden";
    }, 750);
}
