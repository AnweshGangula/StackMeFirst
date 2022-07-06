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
            "badgeText": ""
        };

        if (request.answerCount > 0 || request.commentCount > 0) {
            dict[tabId] = {
                "color": "green",
                "badgeText": badgeText
            };
        }
        sendResponse();
    }
);

chrome.action.onClicked.addListener(alertError);

// fires when active tab changes
chrome.tabs.onActivated.addListener(function (info) {
    chrome.tabs.get(info.tabId, function (tab) {
        updateBadge(tab);
    });
});

// fires when tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    // Note: onUpdated gets fired multiple times: https://stackoverflow.com/a/36818991/6908282
    updateBadge(tab);
});


function updateBadge(tab) {
    // get active tab on current window
    // reference: https://stackoverflow.com/a/36747115/6908282
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setTitle({ tabId: tab.id, title: "Stack Me First" })
    let tabId = tab.id
    var tabInfo = dict[tabId];
    console.log(tabInfo)

    if (tab.url == undefined || tab.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // chrome.action.setPopup({tabId: tabId, popup: ''});
        chrome.action.setIcon({ path: './icons/StackMeFirst_disabled.png', tabId: tabId });
        // console.log({ 'not matching': tab });
    }
    else {
        // chrome.action.setPopup({tabId: tabId, popup: '../html/popup.html'});
        chrome.action.setIcon({ path: './icons/StackMeFirst.png', tabId: tabId });
        // console.log({ 'matched': tab });
        if (tabId in dict) {
            chrome.action.setBadgeBackgroundColor({ color: tabInfo.color }, () => {
                chrome.action.setBadgeText({ text: tabInfo.badgeText });
                chrome.action.setTitle({ tabId: tab.id, title: "Stack Me First - " + tabInfo.badgeText })
            });
        }
    }
}
