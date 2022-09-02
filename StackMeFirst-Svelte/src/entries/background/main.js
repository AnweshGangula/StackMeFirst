import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

browser.runtime.onMessage.addListener(
  //  reference: https://stackoverflow.com/a/20021813/6908282
  function (request, sender, sendResponse) {
    // console.log("message received");
    let content = request.content;
    let subject = request.subject;
    let browserTabId = sender.tab.id;

    if (subject == "isStackOverflow") {
      browser.action.setIcon({ path: '../icons/StackMeFirst.png', tabId: browserTabId });
    }

    if (subject == "needLogin") {
      browser.action.setBadgeText({
        text: "Login",
        tabId: browserTabId,
      }, () => {
        browser.action.setTitle({ title: "Login to Stack Overflow to highlight your answers", tabId: browserTabId });
        browser.action.setBadgeBackgroundColor({ color: "firebrick", tabId: browserTabId });
      });
    }

    if (subject == "loggedIn") {
      let badgeText = `${content.answerCount}A,${content.commentCount}C`
      let pluginTitle = `${content.answerCount} Answers, ${content.commentCount} Comments\n`

      browser.action.setBadgeText({
        text: badgeText,
        tabId: browserTabId,
      }, () => {
        browser.action.setTitle({ title: pluginTitle, tabId: browserTabId });
        browser.action.setBadgeBackgroundColor({ color: "green", tabId: browserTabId });
      });
    }
    sendResponse();
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
    // browser.action.setPopup({popup: '', tabId: tabId});
  }
  else {
    // browser.action.setPopup({popup: '../html/popup.html', tabId: tabId,});

  }
}

