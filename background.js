var alertError = function (arg) {
    if (arg.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // console.log('Something');
    }
};

var dict = {}
chrome.runtime.onMessage.addListener(
    //  reference: https://stackoverflow.com/a/20021813/6908282
    function (request, sender, sendResponse) {
        // console.log("message received");
        let badgeText = `${request.answerCount}A,${request.commentCount}C`
        let tabId = sender.tab.id.toString()
        dict[tabId] = {
            "color": "gray",
            "badgeText": badgeText
        };

        if (request.answerCount > 0 || request.commentCount > 0) {
            dict[tabId].color = "green";
        }
        sendResponse();
    }
);

chrome.browserAction.onClicked.addListener(alertError);

// fires when active tab changes
chrome.tabs.onActivated.addListener(function (info) {
    chrome.tabs.get(info.tabId, function (tab) {
        updateBadge(tab);
    });
});

// fires when tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    updateBadge(tab);
});


function updateBadge(tab) {
    // get active tab on current window
    // reference: https://stackoverflow.com/a/36747115/6908282
    chrome.browserAction.setBadgeText({ text: "" });
    let tabId = tab.id
    var tabInfo = dict[tabId];

    if (tab.url == undefined || tab.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // chrome.browserAction.setPopup({tabId: tabId, popup: ''});
        chrome.browserAction.setIcon({ path: './icons/StackMeFirst - disabled.png', tabId: tabId });
        chrome.browserAction.setTitle({ tabId: tab.id, title: "Stack Me First" })
        // console.log({ 'not matching': tab });
    }
    else {
        // chrome.browserAction.setPopup({tabId: tabId, popup: '../html/popup.html'});
        chrome.browserAction.setIcon({ path: './icons/StackMeFirst.png', tabId: tabId });
        // console.log({ 'matched': tab });
        if (tabId in dict) {
            chrome.browserAction.setBadgeBackgroundColor({ color: tabInfo.color }, () => {
                chrome.browserAction.setBadgeText({ text: tabInfo.badgeText });
                chrome.browserAction.setTitle({ tabId: tab.id, title: tabInfo.badgeText })
            });
        }
    }
}
