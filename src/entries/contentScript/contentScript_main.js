import browser from "webextension-polyfill";

import { ignoreUrlList } from "~/utils/constants";

import Api from "~/utils/stackAPI";

import scrollToTarget from "../executeScript/executeScript"
window.scrollToTarget = scrollToTarget;

export default function highlightStack() {
    let stackAPI = new Api("");
    const currURL = window.location.href // .at(-1)
    const website = window.location.host;
    const isStackOverflow = website == "stackoverflow.com"

    if (isStackOverflow) {
        browser.runtime.sendMessage({
            from: "contentScript",
            subject: "isStackOverflow",
        });

        const currUser = document.querySelector(".s-topbar--item.s-user-card");
        const URLpathname = window.location.pathname;
        const ignoreURL = ignoreUrlList.some((url) => URLpathname.includes(url))
        const isQuestion = (URLpathname.startsWith("/questions/") && !ignoreURL)
        let question, quesAuthor;
        // const currUser = document.getElementsByClassName("s-user-card")[0]; // this is not correct if user I not logged in at this URL: https://stackoverflow.com/questions
        let myAnsList, myCmmtList;

        if (currUser == undefined) {
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
        } else if (isQuestion) {
            question = document.getElementById('question');
            quesAuthor = document.querySelector(".post-signature.owner").getElementsByTagName("a")[0];
            let allAnswers = [];
            let ansIsAPI = true;

            const getAnswers = stackAPI.getAnswers(question.dataset.questionid);

            Promise.all([getAnswers]).then(responses => {
                allAnswers = responses[0];
                if (allAnswers == []) {
                    allAnswers = document.getElementsByClassName('answer');
                    ansIsAPI = false;
                    console.log("API did not work")
                }
                const allComments = document.getElementsByClassName("comment");

                const queryParams = new Proxy(new URLSearchParams(window.location.search), {
                    get: (searchParams, prop) => searchParams.get(prop),
                });
                const isSorted = queryParams.answertab != undefined;

                const DOM_Opts = { currUser, isSorted }

                let defaultConfig = {
                    // You can set default for values not in the storage by providing a dictionary:
                    // reference: https://stackoverflow.com/a/26898749/6908282
                    hlAns: true,
                    srtAns: true,
                    hlCmnts: false,
                }

                browser.storage.sync.get({ 'stackMeData': defaultConfig }).then(function (result) {
                    let userConfig = result.stackMeData;
                    // You can set default for values not in the storage by providing a dictionary:
                    // reference: https://stackoverflow.com/a/26898749/6908282


                    myAnsList = highlightAnswer(allAnswers, ansIsAPI, userConfig, DOM_Opts);
                    myCmmtList = highlightComments(allComments, userConfig, DOM_Opts);
                    browser.runtime.sendMessage({
                        //  reference: https://stackoverflow.com/a/20021813/6908282
                        from: "contentScript",
                        subject: "loggedIn",
                        content: {
                            answerCount: myAnsList == "N/A" ? "?" : myAnsList.length,
                            commentCount: myCmmtList == "N/A" ? "?" : myCmmtList.length
                        }
                    }).then(function () {
                        // console.log("sending message");
                    });

                })
            })
        }

        browser.runtime.onMessage.addListener((msg, sender, response) => {
            // Reference: https://stackoverflow.com/a/20023723/6908282
            // First, validate the message's structure.
            if ((msg.from === 'popup') && (msg.subject === 'popupDOM')) {
                // send data to list answers in popup
                const userURL = currUser == null ? undefined : currUser.href;
                const quesAuth = quesAuthor == null ? undefined : quesAuthor.href;
                var popupContent = {
                    metaData: {
                        currUser: userURL,
                        quesAuthor: quesAuth,
                    },
                    answerList: myAnsList,
                    commentList: myCmmtList,
                };
                response(popupContent); // this sends popupContent dict to SetPopupContent function in popup.js
            }
        });
    }

    function highlightAnswer(answers, ansIsAPI, userConfig, DOM_Opts) {
        const hlAns = userConfig.hlAns;
        const srtAns = userConfig.srtAns;
        const isSorted = DOM_Opts.isSorted;
        const answersHeader = document.getElementById('answers-header');
        const currUser = DOM_Opts.currUser;

        let answerList = [];
        if (hlAns || srtAns) {
            for (let answer of answers) {
                let answerUser, answerId;
                if (ansIsAPI) {
                    answerUser = answer.owner.link;
                    answerId = answer.answer_id;
                } else {
                    const userDetails = answer.querySelectorAll('.user-details');
                    const userHTML = userDetails[userDetails.length - 1];
                    answerUser = userHTML.children.item(0).href;
                    answerId = answer.dataset.answerid;
                }
                if (answerUser == currUser.href) {
                    const answerToHighlight = document.querySelector("#answer-" + answerId);
                    if (!isSorted && srtAns) {
                        insertAfter(answersHeader, answerToHighlight);
                    }
                    if (hlAns) {
                        answerToHighlight.style.cssText = "border: 2px solid darkgreen; border-radius: 5px; margin: 20px 0; padding-left: 5px;"
                    }
                    answerList.push("answer-" + answerId);
                }

                if (currURL.indexOf(answerId) > -1) {
                    // if the user clicks on a link to a specific answer, scroll that into view
                    // answer.scrollIntoView();
                    scrollToTarget("answer-" + answerId, "answer", 40)
                }
            }
        }
        else {
            answerList = "N/A"
        }

        return answerList;
    }

    function highlightComments(comments, userConfig, DOM_Opts) {
        const hlCmnts = userConfig.hlCmnts;
        const currUser = DOM_Opts.currUser;

        let commentList = [];
        if (hlCmnts == true) {
            for (let comment of comments) {
                const commentUser = comment.getElementsByClassName("comment-user")[0];
                if (commentUser.href == currUser.href) {
                    const commentToHighlight = comment.getElementsByClassName("comment-text")[0];
                    commentToHighlight.style.cssText = "border: 2px solid darkgreen; border-radius: 5px; margin: 5px;"
                    commentList.push(comment.id);
                }
            }
        }
        else {
            commentList = "N/A"
        }

        return commentList;
    }

    function insertAfter(referenceNode, newNode) {
        // reference: https://stackoverflow.com/a/4793630/6908282
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

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
