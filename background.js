var alertError = function (arg) {
    if (arg.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // console.log('Something');
    }
};

chrome.runtime.onMessage.addListener(
    //  reference: https://stackoverflow.com/a/20021813/6908282
    function (request, sender, sendResponse) {
        // console.log("message received");
        let badgeText = `${request.answerCount}A,${request.commentCount}C`
        let browserTabId = sender.tab.id;

        chrome.action.setIcon({ path: './icons/StackMeFirst.png', tabId: browserTabId });

        if (badgeText == "0A,0C") return;

        chrome.action.setBadgeText({
            tabId: browserTabId,
            text: badgeText
        }, () => {
            // chrome.action.setTitle({ tabId: tabId, title: "Stack Me First - " + badgeText });
            chrome.action.setBadgeBackgroundColor({ color: "green", tabId: browserTabId });
        });
        sendResponse();
    }
);

chrome.action.onClicked.addListener(alertError);

// fires when active tab changes
chrome.tabs.onActivated.addListener(function (info) {
    chrome.tabs.get(info.tabId, function (tab) {
        // onTabUpdate(tab);
    });
});

// fires when tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    // Note: onUpdated gets fired multiple times: https://stackoverflow.com/a/36818991/6908282
    // onTabUpdate(tab);
});


function onTabUpdate(tab) {

    if (tab.url == undefined || tab.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // chrome.action.setPopup({tabId: tabId, popup: ''});
    }
    else {
        // chrome.action.setPopup({tabId: tabId, popup: '../html/popup.html'});

    }
}
