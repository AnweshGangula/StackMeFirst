import browser from "webextension-polyfill";
import { defaultApiData, StackAppDetails, pageTypeEnum } from "~/utils/constants";
import { GetBrowser } from "~/utils/utils";
import Api from "~/utils/stackAPI";

import backgroundMixpanel from "./mixpabelBackground";
const mixpanel = backgroundMixpanel();

const currBrowser = GetBrowser();
const manifestVer = Number(import.meta.env.VITE_MANIFEST_VERSION)
let browserAction = browser.action;

if (manifestVer == 2) {
  browserAction = browser.browserAction;
}

browser.runtime.onInstalled.addListener(() => {
  // console.log("Extension installed");
});

browser.runtime.onMessage.addListener(
  //  reference: https://stackoverflow.com/a/20021813/6908282
  function (request, sender, sendResponse) {
    // console.log("message received");
    let content = request.content;
    let subject = request.subject;
    let browserTabId = request.from == pageTypeEnum.popup ? null : sender.tab.id;
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
      case "joinCommunity":
        badgeText = "JoinCommunity";
        pluginTitle = "Join this Community to use Stack Me First Plugin";
        color = "firebrick";

        UpdateBadge(badgeText, browserTabId, pluginTitle, color);
        // return true; // must return true to signal asynchronous
        break;
      case "loading":
        UpdateBadge("...", browserTabId, "Loading...", "orange");
        // return true; // must return true to signal asynchronous
        break;
      case "pageIsValid":
        const linkCount = content.token ? "," + content.linkCount + "L" : ""
        const linkCountText = content.token ? ", " + content.linkCount + " Upvoted Links" : ""
        badgeText = `${content.answerCount}A,${content.commentCount}C${linkCount}`;
        pluginTitle = `${content.answerCount} Answers, ${content.commentCount} Comments${linkCountText}\n`;
        color = (badgeText == "0A,0C" || badgeText == "0A,0C,0L") ? "firebrick" : "green";

        UpdateBadge(badgeText, browserTabId, pluginTitle, color);
        break;
      case 'GET_TOKEN':
        Api.auth(sendResponse);
        return true; // must return true to signal asynchronous
        break;
      case 'REMOVE_TOKEN':
        const token = content.token;

        if (currBrowser != "Mozilla Firefox") {
          browser.identity.removeCachedAuthToken({ token }, () => {
          });
        }

        browser.storage.sync.set({ apiData: defaultApiData }).then(function () {
          // UpdateStatus("Options Saved");
          sendResponse({ message: 'successfully removed token' });
        });
        return true; // must return true to signal asynchronous
        break;

      case 'sendMixPanelData':
        mixpanel.trackEvent(request.eventName, content)
        break;
      default:
        console.log(`no matched action: ${subject}`);
    }

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

  color = import.meta.env.VITE_DEV_MODE == "true" ? "firebrick" : color;
  badgeText = import.meta.env.VITE_DEV_MODE == "true" ? "DEV-"+badgeText : badgeText;

  browserAction.setBadgeText({
    text: badgeText,
    tabId: tabId,
  }).then(() => {
    browserAction.setTitle({ title: pluginTitle, tabId: tabId });
    browserAction.setBadgeBackgroundColor({ color: color, tabId: tabId });
  });
}

