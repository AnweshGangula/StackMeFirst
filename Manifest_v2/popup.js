let console = chrome.extension.getBackgroundPage().console;

function loadSearch() {
    console.log("ABC");
    console.log(data);
}

chrome.storage.clear;
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('btnSave').addEventListener('click', save_options);


// Saves options to chrome.storage
// https://developer.chrome.com/docs/extensions/mv3/options/
async function save_options() {
    var color = document.getElementById('color').value;
    var likesColor = document.getElementById('hlComments').checked;
    await setStorageData({
        favoriteColor: color,
        likesColor: likesColor
    }, function () {
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
    chrome.storage.sync.get({
        favoriteColor: 'blue',
        likesColor: true
    }, function (items) {
        document.getElementById('color').value = items.favoriteColor;
        document.getElementById('hlComments').checked = items.likesColor;
    });
}

// https://stackoverflow.com/a/54261558/6908282
const getStorageData = key =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(key, result =>
            chrome.runtime.lastError
                ? reject(Error(chrome.runtime.lastError.message))
                : resolve(result)
        )
    )

const { data } = await getStorageData('data')


const setStorageData = data =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.set(data, () =>
            chrome.runtime.lastError
                ? reject(Error(chrome.runtime.lastError.message))
                : resolve()
        )
    )

await setStorageData({ data: ["someData"] })