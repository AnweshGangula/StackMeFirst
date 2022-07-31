var alertError = function (arg) {
    if (arg.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // console.log('Something');
    }
};

chrome.runtime.onMessage.addListener(
    //  reference: https://stackoverflow.com/a/20021813/6908282
    function (request, sender, sendResponse) {
        // console.log("message received");
        let content = request.content;
        let type = request.type;
        let browserTabId = sender.tab.id;
        if (type == "needLogin") {
            chrome.action.setIcon({ path: './icons/StackMeFirst.png', tabId: browserTabId });
            chrome.action.setBadgeText({
                tabId: browserTabId,
                text: "Login"
            }, () => {
                chrome.action.setTitle({ tabId: browserTabId, title: "Login to Stack Overflow to highlight your answers" });
                chrome.action.setBadgeBackgroundColor({ color: "firebrick", tabId: browserTabId });
            });
        }
        else {
            let badgeText = `${content.answerCount}A,${content.commentCount}C`
            let pluginTitle = `${content.answerCount}Answers, ${content.commentCount}Comments\n`

            chrome.action.setIcon({ path: './icons/StackMeFirst.png', tabId: browserTabId });

            if (badgeText == "0A,0C") return;

            chrome.action.setBadgeText({
                tabId: browserTabId,
                text: badgeText
            }, () => {
                chrome.action.setTitle({ tabId: browserTabId, title: pluginTitle });
                chrome.action.setBadgeBackgroundColor({ color: "green", tabId: browserTabId });
            });
        }
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
