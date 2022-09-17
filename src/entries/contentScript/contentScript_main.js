import browser from "webextension-polyfill";

import { IsStackOverflow, IsQuestion, GetLocalToken } from "~/utils/utils";
import { defaultPreferances, cssStyle } from "~/utils/constants";
import Api from "~/utils/stackAPI";

import scrollToTarget from "../executeScript/executeScript"
window.scrollToTarget = scrollToTarget;

export default async function highlightStack() {
    let stackAPI = new Api("");
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
            browser.runtime.sendMessage({
                //  reference: https://stackoverflow.com/a/20021813/6908282
                from: "contentScript",
                subject: "loading",
            }).then(function () {
                // console.log("sending message");
            });

            question = document.getElementById('question');
            const qId = question.dataset.questionid;
            quesAuthor = document.querySelector(".post-signature.owner").getElementsByTagName("a")[0];
            let ansJson = [];
            let ansIsAPI = true;
            let allComments = [];
            let idforCmts = [];
            let cmtIsAPI = true;

            const getAnswers = await stackAPI.getAnswers(qId);
            ansJson = getAnswers;
            idforCmts.push(qId);
            const cmtIds = getCmtIds(getAnswers);
            idforCmts.push(...cmtIds)

            const getComments = await stackAPI.getComments(idforCmts.join(";"));
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

            browser.storage.sync.get({ 'stackMeData': defaultPreferances }).then(function (result) {
                let userConfig = result.stackMeData;
                // You can set default for values not in the storage by providing a dictionary:
                // reference: https://stackoverflow.com/a/26898749/6908282


                myAnsList = highlightAnswer(ansJson, ansIsAPI, userConfig, DOM_Opts);
                myCmmtList = highlightComments(allComments, cmtIsAPI, userConfig, DOM_Opts);
                linkData = HighlightLinks(userConfig, qId);
                browser.runtime.sendMessage({
                    //  reference: https://stackoverflow.com/a/20021813/6908282
                    from: "contentScript",
                    subject: "loggedIn",
                    content: {
                        answerCount: myAnsList ? myAnsList.length : "?",
                        commentCount: myCmmtList ? myCmmtList.length : "?",
                    }
                }).then(function () {
                    // console.log("sending message");
                });

            })

            function getCmtIds(ansJson) {
                let idforCmts = [];
                if (ansJson == []) {
                    ansJson = document.getElementsByClassName('answer');
                    ansIsAPI = false;
                    console.log("Answers API did not work")
                }

                ansJson.forEach(answer => {
                    if (ansIsAPI) {
                        idforCmts.push(answer.answer_id)
                    } else {
                        idforCmts.push(answer.id)
                    }
                });

                return idforCmts
            }
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
        const currUser = DOM_Opts.currUser;

        const answersHeader = document.getElementById('answers-header');
        const pagination = document.querySelector(".s-pagination.pager-answers");
        const topEle = pagination == null ? answersHeader : pagination;

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
                    const isAnsVisible = answerToHighlight != null
                    let suffix = ""
                    if (isAnsVisible) {
                        // if answer is paginated, it will not be visible in current page.
                        // Eg: https://stackoverflow.com/questions/7244321/how-do-i-update-or-sync-a-forked-repository-on-github?page=2&tab=scoredesc#tab-top 
                        if (!isSorted && srtAns) {
                            insertAfter(topEle, answerToHighlight);
                        }
                        if (hlAns) {
                            answerToHighlight.style.cssText = cssStyle + "margin: 20px 0; padding-left: 5px;"
                        }
                    } else {
                        suffix = " (hidden)"
                    }
                    answerList.push("answer-" + answerId + suffix);
                }

                if (currURL.indexOf(answerId + "#" + answerId) > -1) {
                    // if the user clicks on a link to a specific answer, scroll that into view
                    // answer.scrollIntoView();
                    scrollToTarget("answer-" + answerId, "answer", 60)
                }
            }
        }
        else {
            answerList = undefined;
        }

        return answerList;
    }

    function highlightComments(comments, cmtIsAPI, userConfig, DOM_Opts) {
        const hlCmnts = userConfig.hlCmnts;
        const currUser = DOM_Opts.currUser;


        let commentList = [];
        if (hlCmnts == true) {
            for (let comment of comments) {
                let commentUser, commentId;
                if (cmtIsAPI) {
                    commentUser = comment.owner.link;
                    commentId = comment.comment_id;
                } else {
                    commentUser = comment.getElementsByClassName("comment-user")[0].href;
                    commentId = comment.dataset.commentId;
                }
                if (commentUser == currUser.href) {
                    const commentEle = document.getElementById("comment-" + commentId);
                    let suffix = ""
                    if (commentEle == null) {
                        // if comment is hidden
                        suffix = " (hidden)"
                        // console.log("Hidden comment: #comment-" + commentId)
                    } else {
                        const commentToHighlight = commentEle.getElementsByClassName("comment-text")[0];
                        commentToHighlight.style.cssText = cssStyle + "margin: 5px;"
                    }

                    commentList.push("comment-" + commentId + suffix);
                }
            }
        }
        else {
            commentList = undefined;
        }

        return commentList;
    }

    function HighlightLinks(preferences, currentQid) {
        let linkedQids = [];
        let token = "";
        if (preferences.hlLinkQs) {
            Promise.resolve(GetLocalToken()).then(async function (result) {
                // TODO: Replace Promise with Async-Await
                token = result;
                if (token != "") {
                    const stackAPI = new Api(token);
                    const allLinkedQs = await stackAPI.getLinkedQues(currentQid);
                    const domLinkedQ = document.getElementById("h-linked").parentNode.querySelector(".linked")
                    allLinkedQs.forEach((ques) => {
                        if (ques.upvoted) {
                            let isHidden = " (hidden)"
                            for (let link of domLinkedQ.children) {
                                const isLink = !Array.from(link.classList).includes("more"); // if the child is "See more inked         questions DOM"
                                const isUpvoted = (("gpsTrack" in link.dataset) && link.dataset.gpsTrack.includes(ques.question_id));
                                if (isLink && isUpvoted) {
                                    isHidden = ""
                                    link.style.cssText = cssStyle + "padding: 5px;"
                                }
                            }

                            linkedQids.push({ linkJson: ques, hidden: isHidden });
                        }
                    });


                }

            });

        }
        browser.runtime.onMessage.addListener((msg, sender, response) => {

            if ((msg.from === 'popup') && (msg.subject === 'popupLinkQs')) {
                response({ token, linkedQids }); // this sends linkData dict to Linkedues.svelte
            }
        });
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
