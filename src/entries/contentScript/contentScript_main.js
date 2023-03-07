import browser from "webextension-polyfill";

import { getCmtIds, highlightAnswer, highlightComments, HighlightLinks } from "./helpers/contentScriptHelpers";
import { IsStackOverflow, IsQuestion } from "~/utils/utils";
import { defaultPreferances } from "~/utils/constants";
import Api from "~/utils/stackAPI";

import scrollToTarget from "../executeScript/executeScript"
window.scrollToTarget = scrollToTarget;

export default async function highlightStack() {
    let stackAPI = new Api("");
    let output = {};
    //TODO: if logged, then add token for stackAPI above. This will help with API limitations: https://api.stackexchange.com/docs/throttle#:~:text=If%20an%20application%20does%20have%20an%20access_token
    const currURL = window.location.href // .at(-1)

    if (IsStackOverflow(currURL)) {
        browser.runtime.sendMessage({
            from: "contentScript",
            subject: "isStackOverflow",
        });

        const currUser = document.querySelector(".s-topbar--item.s-user-card");
        const isQuestion = IsQuestion(window.location.href)
        let question, quesAuthor;
        // const currUser = document.getElementsByClassName("s-user-card")[0]; // this is not correct if user I not logged in at this URL: https://stackoverflow.com/questions
        let myAnsList, myCmmtList, linkData;
        const userURL = currUser == null ? undefined : currUser.href;
        const userLoggedIn = Array.from(document.getElementsByClassName("s-topbar--item")).filter(a => a.localName == "a" && a.href.includes("users/login?")).length == 0;
        const userInCommunity = userLoggedIn && currUser;

        var popupContent = {
            userInCommunity: userInCommunity,
            metaData: {
                currUser: userURL,
            },
        };

        if (currUser == undefined) {

            if (userLoggedIn) {
                // if user has not joined the community

                browser.runtime.sendMessage({
                    //  reference: https://stackoverflow.com/a/20021813/6908282
                    from: "contentScript",
                    subject: "joinCommunity",
                    content: {
                        currUser: currUser,
                    }
                }).then(function () {
                    // console.log("sending message");
                });
            } else {


                // if there is a "Login" button in the navbar
                browser.runtime.sendMessage({
                    //  reference: https://stackoverflow.com/a/20021813/6908282
                    from: "contentScript",
                    subject: "needLogin",
                    content: {
                        currUser: currUser,
                    }
                }).then(function () {
                    // console.log("sending message");
                });
            }

        } else if (isQuestion) {
            browser.runtime.sendMessage({
                //  reference: https://stackoverflow.com/a/20021813/6908282
                from: "contentScript",
                subject: "loading",
            }).then(function () {
                // console.log("sending message");
            });

            question = document.getElementById('question');
            const qId = question.dataset.questionid;
            quesAuthor = document.querySelector(".post-signature.owner")?.getElementsByTagName("a")[0];
            let ansJson = [];
            let ansIsAPI = true;
            let allComments = [];
            let idforCmts = [];
            let cmtIsAPI = true;

            const getAnswers = await stackAPI.getAnswers(currURL, qId);
            ansJson = getAnswers;
            idforCmts.push(qId);
            const cmtIds = getCmtIds(getAnswers, ansIsAPI);
            idforCmts.push(...cmtIds)

            const getComments = await stackAPI.getComments(currURL, idforCmts.join(";"));
            allComments = getComments;
            if (allComments == []) {
                allComments = document.getElementsByClassName("comment");
                cmtIsAPI = false;
                console.log("Comments API did not work")
            }

            const queryParams = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            const isSorted = queryParams.answertab != undefined;

            const DOM_Opts = { currUser, isSorted }

            const quesAuth = quesAuthor == null ? undefined : quesAuthor.href;
            popupContent.metaData.quesAuthor = quesAuth;

            const result = await browser.storage.sync.get({ 'stackMeData': defaultPreferances });

            const userConfig = result.stackMeData;
            // You can set default for values not in the storage by providing a dictionary:
            // reference: https://stackoverflow.com/a/26898749/6908282


            myAnsList = highlightAnswer(ansJson, ansIsAPI, userConfig, DOM_Opts, currURL);
            myCmmtList = highlightComments(allComments, cmtIsAPI, userConfig, DOM_Opts);

            const linkData = await HighlightLinks(userConfig, currURL, qId, DOM_Opts);

            popupContent.answerList = myAnsList;
            popupContent.commentList = myCmmtList;
            popupContent.linkData = linkData;

            browser.runtime.sendMessage({
                //  reference: https://stackoverflow.com/a/20021813/6908282
                from: "contentScript",
                subject: "pageIsValid",
                content: {
                    answerCount: myAnsList ? myAnsList.length : "?",
                    commentCount: myCmmtList ? myCmmtList.length : "?",
                    linkCount: linkData.hlLinkQ ? linkData.linkedQids.length : "?",
                    token: linkData.token,
                }
            }).then(function () {
                // console.log("sending message");
            });

            output = {
                userConfig,
                popupContent,
            }
        }
        browser.runtime.onMessage.addListener((msg, sender, response) => {
            // Reference: https://stackoverflow.com/a/20023723/6908282
            // First, validate the message's structure.
            if ((msg.from === 'popup') && (msg.subject === 'popupDOM')) {
                // send data to list answers in popup
                response(popupContent); // this sends popupContent dict to SetPopupContent function in popup.js
            }
        });
    }
    return output;
}

export async function renderContent(
    cssPaths,
    render = (_appRoot) => { }
) {
    const appContainer = document.createElement("div");
    const shadowRoot = appContainer.attachShadow({
        mode: import.meta.env.DEV ? "open" : "closed",
    });
    const appRoot = document.createElement("div");

    if (import.meta.hot) {
        const { addViteStyleTarget } = await import(
            "@samrum/vite-plugin-web-extension/client"
        );

        await addViteStyleTarget(shadowRoot);
    } else {
        cssPaths.forEach((cssPath) => {
            const styleEl = document.createElement("link");
            styleEl.setAttribute("rel", "stylesheet");
            styleEl.setAttribute("href", browser.runtime.getURL(cssPath));
            shadowRoot.appendChild(styleEl);
        });
    }

    shadowRoot.appendChild(appRoot);
    document.body.appendChild(appContainer);

    render(appRoot);
}
