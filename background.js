var alertError = function (arg) {
    if (arg.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // console.log('Something');
    }
};

chrome.runtime.onMessage.addListener(
    //  reference: https://stackoverflow.com/a/20021813/6908282
    function (request, sender, sendResponse) {
        color = "gray";
        count = "0";
        if (request.total_elements > 0) {
            color = "green";
            count = request.total_elements.toString();
        }
        // localStorage["total_elements"] = request.count;
        chrome.action.setBadgeBackgroundColor({ color: color }, () => {
            chrome.action.setBadgeText({ text: count });
        });
        sendResponse();
    }
);

chrome.action.onClicked.addListener(alertError);

chrome.tabs.onActivated.addListener(function (info) {
    // reference: https://stackoverflow.com/a/24652607/6908282
    chrome.tabs.get(info.tabId, function (change) {
        if (change.url == undefined) {
            // chrome.action.setPopup({tabId: info.tabId, popup: ''});
            chrome.action.setIcon({ path: './icons/StackMeFirst - disabled.png', tabId: info.tabId });
            // console.log('undefined');
        }
        else if (change.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
            // chrome.action.setPopup({tabId: info.tabId, popup: ''});
            chrome.action.setIcon({ path: './icons/StackMeFirst - disabled.png', tabId: info.tabId });
            // console.log('not matching');
        }
        else {
            // chrome.action.setPopup({tabId: info.tabId, popup: '../html/popup.html'});
            chrome.action.setIcon({ path: './icons/StackMeFirst.png', tabId: info.tabId });
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
        // chrome.action.setPopup({tabId: tabId, popup: ''});
        chrome.action.setIcon({ path: './icons/StackMeFirst - disabled.png', tabId: tabId });
        // console.log('not matching');
    }
    else {
        // chrome.action.setPopup({tabId: tabId, popup: '../html/popup.html'});
        chrome.action.setIcon({ path: './icons/StackMeFirst.png', tabId: tabId });
        // console.log('matched');
    }
});

