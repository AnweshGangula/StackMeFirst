import browser from "webextension-polyfill";

const manifestVer = Number(import.meta.env.VITE_MANIFEST_VERSION)
let browserAction = browser.action;
if (manifestVer == 2) {
  browserAction = browser.browserAction;
}

browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

browser.runtime.onMessage.addListener(
  //  reference: https://stackoverflow.com/a/20021813/6908282
  function (request, sender, sendResponse) {
    // console.log("message received");
    let content = request.content;
    let subject = request.subject;
    let browserTabId = request.from == "popup" ? null : sender.tab.id;
    let badgeText, pluginTitle, color;

    switch (subject) {
      case "isStackOverflow":
        browserAction.setIcon({ path: '../icons/StackMeFirst.png', tabId: browserTabId });
        // return true; // must return true to signal asynchronous
        break;
      case "needLogin":
        badgeText = "Login";
        pluginTitle = "Login to Stack Overflow to highlight your answers";
        color = "firebrick";

        UpdateBadge(badgeText, browserTabId, pluginTitle, color);
        // return true; // must return true to signal asynchronous
        break;
      case "loggedIn":
        badgeText = `${content.answerCount}A,${content.commentCount}C`;
        pluginTitle = `${content.answerCount} Answers, ${content.commentCount} Comments\n`;
        color = "green";

        UpdateBadge(badgeText, browserTabId, pluginTitle, color);
        break;
      case 'AUTH':
        alert("Message Received");
        break;
      default:
        console.log(`no matched action: ${subject}`);
    }
    return true; // must return true to signal asynchronous

  }
);

// fires when active tab changes
browser.tabs.onActivated.addListener(function (info) {
  browser.tabs.get(info.tabId).then(function (tab) {
    // onTabUpdate(tab);
  });
});

// fires when tab is updated
browser.tabs.onUpdated.addListener(function (tabId, change, tab) {
  // Note: onUpdated gets fired multiple times: https://stackoverflow.com/a/36818991/6908282
  // onTabUpdate(tab);
});


function onTabUpdate(tab) {

  if (tab.url == undefined || tab.url.match(/https:\/\/stackoverflow\.com\/*/) == null) {
    // browserAction.setPopup({popup: '', tabId: tabId});
  }
  else {
    // browserAction.setPopup({popup: '../html/popup.html', tabId: tabId,});

  }
}

function UpdateBadge(badgeText, tabId, pluginTitle, color) {
  browserAction.setBadgeText({
    text: badgeText,
    tabId: tabId,
  }).then(() => {
    browserAction.setTitle({ title: pluginTitle, tabId: tabId });
    browserAction.setBadgeBackgroundColor({ color: color, tabId: tabId });
  });
}
