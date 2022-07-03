var alertError = function (arg) {
    if (arg.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // console.log('Something');
    }
};
chrome.browserAction.onClicked.addListener(alertError);

chrome.tabs.onActivated.addListener(function (info) {
    // reference: https://stackoverflow.com/a/24652607/6908282
    chrome.tabs.get(info.tabId, function (change) {
        if (change.url == undefined) {
            // chrome.browserAction.setPopup({tabId: info.tabId, popup: ''});
            chrome.browserAction.setIcon({ path: './icons/StackMeFirst - disabled.png', tabId: info.tabId });
            // console.log('undefined');
        }
        else if (change.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
            // chrome.browserAction.setPopup({tabId: info.tabId, popup: ''});
            chrome.browserAction.setIcon({ path: './icons/StackMeFirst - disabled.png', tabId: info.tabId });
            // console.log('not matching');
        }
        else {
            // chrome.browserAction.setPopup({tabId: info.tabId, popup: '../html/popup.html'});
            chrome.browserAction.setIcon({ path: './icons/StackMeFirst.png', tabId: info.tabId });
            // console.log('matched');
        }
    });
});
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    // reference: https://stackoverflow.com/a/24652607/6908282
    if (tab.url == undefined) {
        return;
    }
    else if (tab.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // chrome.browserAction.setPopup({tabId: tabId, popup: ''});
        chrome.browserAction.setIcon({ path: './icons/StackMeFirst - disabled.png', tabId: tabId });
        // console.log('not matching');
    }
    else {
        // chrome.browserAction.setPopup({tabId: tabId, popup: '../html/popup.html'});
        chrome.browserAction.setIcon({ path: './icons/StackMeFirst.png', tabId: tabId });
        // console.log('matched');
    }
});

