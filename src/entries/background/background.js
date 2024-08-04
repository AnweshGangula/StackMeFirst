import browser from "webextension-polyfill";
import { defaultApiData, StackAppDetails, pageTypeEnum } from "~/utils/constants";
import { GetBrowser, GetLocalTokenData, IsValidStackExchangeSite, getUrlRootDomain } from "~/utils/utils";
import Api from "~/utils/stackAPI";
import pkg from "../../../package.json"

import backgroundMixpanel from "./mixpanelBackground";
import SmfMixpanel from "~/utils/mixpanel";
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

function OpenGettingStartedPage(tab, accountId){
  const website = getUrlRootDomain(tab.url) ?? "";

  const isStack = website ? IsValidStackExchangeSite(tab.url) : false;

  const queryParameters = new URLSearchParams();
  if (isStack) {
    queryParameters.append("domain", website)
  }
  if(accountId){
    queryParameters.append("accountId", accountId)
  }

  const gettingStartedPage_Url = browser.runtime.getURL('/src/entries/gettingStarted/index.html') + (queryParameters.size > 0 ? "?" + queryParameters.toString() : "");

  console.log({ gettingStartedPage_Url })

  browser.tabs.create({
    url: gettingStartedPage_Url,
    openerTabId: tab.id,

    // active: false, // this does not affter the tab being focused - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/create#active
  })

  const pageViewData = {
      sourcePage: tab.url,
      pageType: pageTypeEnum.gettingStarted
  };
  const mixpanel = new SmfMixpanel(pageViewData);
  mixpanel.trackEvent("Open Getting Started Page", {
    eventSource: tab.url
  });
  // })
}

browser.runtime.onMessage.addListener(
  //  reference: https://stackoverflow.com/a/20021813/6908282
  function (request, sender, sendResponse) {
    // console.log("message received");
    let content = request.content;
    let subject = request.subject;
    let browserTabId = request.from == pageTypeEnum.popup ? null : sender.tab.id;
    let badgeText, badgeTitle, color;

    switch (subject) {
      case "isValidStackSite":
        browserAction.setIcon({ path: '../icons/StackMeFirst.png', tabId: browserTabId });
        // return true; // must return true to signal asynchronous
        break;

      case "searchUrlInHistory":
        // ref: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/getVisits#examples

        let searching = browser.history.search({
          text: content.url,
          startTime: 0,
          maxResults: 1,
        });
        
        searching.then(listVisits);

        
        function listVisits(historyItems) {
          if (historyItems.length) {
            console.log(`URL ${historyItems[0].url}`);
            const gettingVisits = browser.history.getVisits({
              url: historyItems[0].url,
            });
            gettingVisits.then((visits)=> gotVisits(visits, historyItems));
          }
        }
        
        function gotVisits(visits, historyItems) {
          console.log(`Visit count: ${visits.length}`);
          // for (const visit of visits) {
            console.log({visits, historyItems});
            sendResponse({ 
              message: 'found url in history',
              data: {visits, historyItems}
            })
          // }
        }

        // function listUrlHistoryVisit(url){
        //     const gettingVisits = browser.history.getVisits({
        //       url: url,
        //     });
        //     gettingVisits.then(gotVisits);
        // }
        
        // listUrlHistoryVisit(content.url);

        break;
      case "needLogin":
        badgeText = "Login";
        badgeTitle = "Login to this Stack Exchange community to highlight your answers";
        color = "firebrick";

        UpdateBadge(badgeText, browserTabId, badgeTitle, color);
        // return true; // must return true to signal asynchronous
        break;
      case "joinCommunity":
        badgeText = "Join";
        badgeTitle = "Join this Community to use Stack Me First Plugin";
        color = "firebrick";

        UpdateBadge(badgeText, browserTabId, badgeTitle, color);
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
        badgeTitle = `${content.answerCount} Answers, ${content.commentCount} Comments${linkCountText}\n`;
        color = (badgeText == "0A,0C" || badgeText == "0A,0C,0L") ? "firebrick" : "green";

        UpdateBadge(badgeText, browserTabId, badgeTitle, color);
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

      case 'openGettingStarted':

        OpenGettingStartedPage(sender.tab, content.accountId)
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

function UpdateBadge(badgeText, tabId, badgeTitle, color) {

  color = import.meta.env.VITE_DEV_MODE == "true" ? "firebrick" : color;
  badgeText = (import.meta.env.VITE_DEV_MODE == "true" ? "DEV-" : "") + badgeText;

  browserAction.setBadgeText({
    text: badgeText,
    tabId: tabId,
  }).then(() => {
    browserAction.setTitle({ title: badgeTitle, tabId: tabId });
    browserAction.setBadgeBackgroundColor({ color: color, tabId: tabId });
  });
}

async function initContextMenus(){

  const tokenData = await GetLocalTokenData();
  const token = tokenData.token;
  const profileData = tokenData;
  const accountId = tokenData.accountId;

  const contextMenuId = {
    gettingStarted: "gettingStarted"
  }

  function contextMenuClick(info,tab) {

    console.log("Context Click")
    if (info.menuItemId == contextMenuId.gettingStarted) {
      OpenGettingStartedPage(tab, accountId)
    }

  }

  browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({
      title: (pkg.displayName ?? "Stack Me First") +  " - Menu",
      id: (pkg.name ??"stackMeFirst"),
      contexts: ["all"]
    })

    // for (const {id: id, title: title, parentId: parentId, contexts: contexts} of MENUS) {

        browser.contextMenus.create({
          parentId: "stackMeFirst",
          title: "🚀 Open Getting Started Page", 
          contexts:["all"], 
          id: contextMenuId.gettingStarted
        })
    // }
  })

  browser.contextMenus.onClicked.addListener(contextMenuClick)
}

// initContextMenus();
