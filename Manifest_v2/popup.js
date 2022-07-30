let console = chrome.extension.getBackgroundPage().console;
let defaultOptions = {
    highlightComments: false,
    highlightLinkedQues: false,
}

async function displayHTML() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        // get current Tab - https://stackoverflow.com/a/29151677/6908282
        let activeTab = tabs[0];
        let activeURL = new URL(activeTab.url)
        let currURL = activeURL.href // .at(-1)
        let website = activeURL.host;
        console.log(activeURL);
        if (website == "stackoverflow.com") {
            document.getElementById("notification").style.display = "none";
        }
        else {
            document.getElementById("notification").style.display = "block";
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
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
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

    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options reset.';
    setTimeout(function () {
        status.textContent = '';
    }, 750);
    restore_options;
}
