import browser from "webextension-polyfill";

import { extractHTMLContent, GetLocalTokenData, TrimText } from "~/utils/utils";
import Api from "~/utils/stackAPI";
import scrollToTarget from "../../executeScript/executeScript"

export function getCmtIds(ansJson, ansIsAPI) {
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

export function highlightAnswer(answers, ansIsAPI, userConfig, DOM_Opts, currURL) {
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
            let answerUser, answerId, body;
            if (ansIsAPI) {
                answerUser = answer.owner.link;
                answerId = answer.answer_id;
                body = TrimText(extractHTMLContent(answer.body));
            } else {
                const userDetails = answer.querySelectorAll('.user-details');
                const userHTML = userDetails[userDetails.length - 1];
                answerUser = userHTML.children.item(0).href;
                answerId = answer.dataset.answerid;
                body = TrimText(answer.querySelectorAll(".answercell")[0].textContent.replaceAll("\n    ",""));
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
                        answerToHighlight.classList.add("smfHighlight", "smfAnswer");
                    }
                } else {
                    suffix = " (hidden)"
                }
                answerList.push({answerId, suffix, title: body});
            }

            if (currURL.indexOf(answerId + "#" + answerId) > -1) {
                // if the user clicks on a link to a specific answer, scroll that into view
                // answer.scrollIntoView();
                scrollToTarget(answerId, "answer", 60)
            }
        }
    }
    else {
        answerList = undefined;
    }

    return answerList;
}

export function highlightComments(comments, cmtIsAPI, userConfig, DOM_Opts) {
    const hlCmnts = userConfig.hlCmnts;
    const currUser = DOM_Opts.currUser;


    let commentList = [];
    if (hlCmnts == true) {
        for (let comment of comments) {
            let commentUser, commentId, body, parentId;
            if (cmtIsAPI) {
                commentUser = comment.owner.link;
                commentId = comment.comment_id;
                body = TrimText(extractHTMLContent(comment.body));
                parentId = comment.post_id.toString();
            } else {
                commentUser = comment.getElementsByClassName("comment-user")[0].href;
                commentId = comment.dataset.commentId;
                body = TrimText(comment.querySelectorAll(".comment-copy")[0].textContent);
                parentId = comment.querySelectorAll(".comment-copy")[0].closest(".question").dataset.questionid;
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
                    commentToHighlight.classList.add("smfHighlight", "smfCmtLnk")
                }

                commentList.push({commentId, suffix, title: body, cmtParentId: parentId});
            }
        }
    }
    else {
        commentList = undefined;
    }

    return commentList;
}

export async function HighlightLinks(preferences, currURL, currentQid, DOM_Opts) {
    // example URL: https://api.stackexchange.com/docs/linked-questions#order=desc&sort=activity&ids=73591695&site=stackoverflow&run=true
    const currUser = DOM_Opts.currUser;
    let linkedQids = [];
    let token = "";
    const hlLinkQ = preferences.hlLinkQs;
    if (hlLinkQ) {
        const tokenData = await GetLocalTokenData();
        token = tokenData.token;
        if (token != "") {
            const stackAPI = new Api(token);
            const allLinkedQs = await stackAPI.getLinkedQues(currURL, currentQid);
            const domLinkedQ = document.getElementById("h-linked")?.parentNode.querySelector(".linked");
            // console.log("DOM linkedQ: ", allLinkedQs)
            allLinkedQs.forEach((ques) => {
                const isQuesAuthor = ques.owner.link == currUser.href
                if (ques.upvoted || ques.favorited || isQuesAuthor) {
                    let isHidden = " (hidden)";
                    let isFavorite = ques.favorited ? " (favorite)" : "";
                    let isAuthor = isQuesAuthor ? " (author)" : "";

                    for (let link of domLinkedQ?.children) {
                        // check if question is visible in DOM
                        const isLink = !Array.from(link.classList).includes("more"); // if the child is "See more linked questions DOM"
                        const isUpvoted = (("gpsTrack" in link.dataset) && link.dataset.gpsTrack.includes(ques.question_id));
                        if (isLink && isUpvoted) {
                            isHidden = ""
                            link.classList.add("smfHighlight", "smfCmtLnk");
                            if (ques.favorited) {
                                link.classList.add("smfFavorite")
                            }
                            if(isAuthor){
                                link.classList.add("smfAuthor")
                            }
                        }
                    }

                    linkedQids.push({ linkJson: ques, isHidden: isHidden, isFavorite: isFavorite, isAuthor: isAuthor });
                }
            });
        }

    }
    browser.runtime.onMessage.addListener((msg, sender, response) => {

        if ((msg.from === 'popup') && (msg.subject === 'popupLinkQs')) {
            response({ token, linkedQids }); // this sends linkData dict to Linkedues.svelte
        }
    });

    return { hlLinkQ, linkedQids, token };
}

function insertAfter(referenceNode, newNode) {
    // reference: https://stackoverflow.com/a/4793630/6908282
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}