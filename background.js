var alertError = function (arg) {
    if (arg.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
        // console.log('Something');
    }
};

var dict = {}
chrome.runtime.onMessage.addListener(
    //  reference: https://stackoverflow.com/a/20021813/6908282
    function (request, sender, sendResponse) {
        let tabId = sender.tab.id.toString()
        dict[tabId] = {
            "color": "gray",
            "count": request.total_elements.toString()
        };

        if (request.total_elements > 0) {
            dict[tabId].color = "green";
        }
        // console.log(dict);
        sendResponse();
    }
);

chrome.action.onClicked.addListener(alertError);

// fires when active tab changes
chrome.tabs.onActivated.addListener(updateBadge);

// fires when tab is updated
chrome.tabs.onUpdated.addListener(updateBadge);


function updateBadge() {
    // get active tab on current window
    // reference: https://stackoverflow.com/a/36747115/6908282
    chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
        // the return value is an array
        var activeTab = arrayOfTabs[0];
        if (!activeTab) return;
        // compute number for badge for current tab's url
        let tabId = activeTab.id
        var tabInfo = dict[tabId];

        if (activeTab.url == undefined || activeTab.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
            // chrome.action.setPopup({tabId: tabId, popup: ''});
            chrome.action.setIcon({ path: './icons/StackMeFirst - disabled.png', tabId: tabId });
            // console.log('not matching');
            chrome.action.setBadgeText({ text: "" });

        }
        else {
            // chrome.action.setPopup({tabId: tabId, popup: '../html/popup.html'});
            chrome.action.setIcon({ path: './icons/StackMeFirst.png', tabId: tabId });
            // console.log('matched');
            if (tabId in dict) {
                chrome.action.setBadgeBackgroundColor({ color: tabInfo.color }, () => {
                    chrome.action.setBadgeText({ text: tabInfo.count });
                });
            }
        }

    });
}


