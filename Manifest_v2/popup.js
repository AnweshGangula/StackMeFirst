let console = chrome.extension.getBackgroundPage().console;

// chrome.storage.sync.clear(); // use this while development to clear any existing options
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('btnSave').addEventListener('click', save_options);


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
    // Use default value color = 'red' and likesColor = true.
    let stackMeData = {
        highlightComments: true,
        highlightLinkedQues: false,
    }
    chrome.storage.sync.get(stackMeData, function (items) {
        document.getElementById('hlComments').checked = items.highlightComments;
        document.getElementById('hlComments').value = items.highlightLinkedQues;
    });
}
