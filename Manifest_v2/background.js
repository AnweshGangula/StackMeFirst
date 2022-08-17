chrome.runtime.onMessage.addListener(
    //  reference: https://stackoverflow.com/a/20021813/6908282
    function (request, sender, sendResponse) {
        // console.log("message received");
        let content = request.content;
        let subject = request.subject;
        let browserTabId = sender.tab.id;
        if (subject == "needLogin") {
            chrome.browserAction.setIcon({ path: './icons/StackMeFirst.png', tabId: browserTabId });
            chrome.browserAction.setBadgeText({
                text: "Login",
                tabId: browserTabId,
            }, () => {
                chrome.browserAction.setTitle({ title: "Login to Stack Overflow to highlight your answers", tabId: browserTabId });
                chrome.browserAction.setBadgeBackgroundColor({ color: "firebrick", tabId: browserTabId });
            });
        }
        else {
            let badgeText = `${content.answerCount}A,${content.commentCount}C`
            let pluginTitle = `${content.answerCount}Answers, ${content.commentCount}Comments\n`

            chrome.browserAction.setIcon({ path: './icons/StackMeFirst.png', tabId: browserTabId });

            if (badgeText == "0A,0C") return;

            chrome.browserAction.setBadgeText({
                text: badgeText,
                tabId: browserTabId,
            }, () => {
                chrome.browserAction.setTitle({ title: pluginTitle, tabId: browserTabId });
                chrome.browserAction.setBadgeBackgroundColor({ color: "green", tabId: browserTabId });
            });
        }
        sendResponse();
    }
);

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
        // chrome.browserAction.setPopup({popup: '', tabId: tabId});
    }
    else {
        // chrome.browserAction.setPopup({popup: '../html/popup.html', tabId: tabId,});

    }
}

chrome.browserAction.onClicked.addListener(alertError);

var alertError = function (arg) {
    if (arg.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // console.log('Something');
    }
};