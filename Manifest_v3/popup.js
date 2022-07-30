// chrome.storage.sync.clear(); // use this while development to clear any existing options
// let console = chrome.extension.getBackgroundPage().console;
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
        chrome.action.getBadgeText({ tabId: activeTab.id }, badgeText => {
            // https://stackoverflow.com/a/73178480/6908282
            if (badgeText == "" || badgeText == "0A0C" || !URLpathname.startsWith("/questions")) {
                document.getElementById("notification").style.display = "block"
            }
        });
        // if (website != "stackoverflow.com" || website != "extensions") {
        //     console.log(website);
        //     document.getElementById("config").style.display = "none";
        // }
    });

}

document.addEventListener('DOMContentLoaded', displayHTML);
document.getElementById('btnSave').addEventListener('click', save_options);
document.getElementById('btnReset').addEventListener('click', reset_options);


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
        UpdateStatus("Options Saved.");
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

function UpdateUI(Options) {
    document.getElementById('hlAnswers').checked = Options.hlAns;
    document.getElementById('srtAns').checked = Options.srtAns;
    document.getElementById('hlComments').checked = Options.hlCmnts;
}
