import browser from "webextension-polyfill";

import { extractHTMLContent, GetLocalTokenData, TrimText } from "~/utils/utils";
import Api from "~/utils/stackAPI";
import scrollToTarget from "../../executeScript/executeScript"

import logo from "~/assets/logo.svg";
const logoImageUrl = new URL(logo, import.meta.url).href;

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
        const ansToSort = {};
        for (let answer of answers) {
            let answerUser, answerId, body;
            if(!answer.upvoted){
                // if user did not Login to Stack Exchange, then the API will not return the upvoted status of the answer
                const upvoted = document.getElementById(`answer-${answer.answer_id}`)?.getElementsByClassName("js-vote-up-btn")[0].ariaPressed
                answer.upvoted = upvoted == "true";
            }
            if (ansIsAPI) {
                answerUser = answer.owner.link;
                answerId = answer.answer_id;
                body = TrimText(extractHTMLContent(answer.body));
            } else {
                const userDetails = answer.querySelectorAll('.user-details');
                const userHTML = userDetails[userDetails.length - 1];
                answerUser = userHTML.children.item(0).href;
                answerId = answer.dataset.answerid;
                body = TrimText(answer.querySelectorAll(".answercell")[0].textContent.replaceAll("\n    ", ""));
            }
            if (answerUser == currUser.href || answer.upvoted) {
                const answerToHighlight = document.querySelector("#answer-" + answerId);
                const isAnsVisible = answerToHighlight != null
                let suffix = ""
                if (isAnsVisible) {
                    // if answer is paginated, it will not be visible in current page.
                    // Eg: https://stackoverflow.com/questions/7244321/how-do-i-update-or-sync-a-forked-repository-on-github?page=2&tab=scoredesc#tab-top 
                    if (hlAns) {
                        answerToHighlight.classList.add("smfHighlight", "smfAnswer");
                        if(answer.upvoted){
                            answerToHighlight.classList.add("smfUpvoted");
                            
                        }
                    }
                    if (!isSorted && srtAns) {

                        ansToSort[answerId] = {
                            apiAnswer: answer,
                            domElement: answerToHighlight
                        };

                        // insertAfter(topEle, answerToHighlight);
                    }
                } else {
                    suffix = " (hidden)"
                }
                if(answerUser == currUser.href) suffix += " (author)";
                answerList.push({ answerId, suffix, title: body });
            }

            if (currURL.indexOf(answerId + "#" + answerId) > -1) {
                // if the user clicks on a link to a specific answer, scroll that into view
                // answer.scrollIntoView();
                scrollToTarget(answerId, "answer", 60)
            }
        }

        if(Object.keys(ansToSort).length > 0){
            const sortedAnsScore = Object.values(ansToSort).sort((a, b) => {
                const aScore = a.apiAnswer.score;
                const bScore = b.apiAnswer.score;
                return aScore - bScore;
            });

            // const sortMyAns = Object.values(ansToSort).sort((a, b) => {
            //     const aOwner = a.owner.link;
            //     const bOwner = b.apiAnswer.score;
            //     return bScore - aScore;
            // });

            // const myAns = Object.values(ansToSort).filter(ans => ans.apiAnswer.owner.link == currUser.href);
            const myAnsKeys = Object.keys(ansToSort).filter(ans => ansToSort[ans].apiAnswer.owner.link == currUser.href);

            sortedAnsScore.forEach(ans => {
                insertAfter(topEle, ans.domElement);
            });

            if(myAnsKeys.length > 0){
                const myAns = myAnsKeys.map(key => ansToSort[key]);
                const sortMyAns = myAns.sort((a, b) => {
                    const aScore = a.apiAnswer.score;
                    const bScore = b.apiAnswer.score;
                    return aScore - bScore;
                })
                sortMyAns.forEach(ans => {
                    insertAfter(topEle, ans.domElement);
                });
            };
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
                if (!commentEle) {
                    // if comment is hidden
                    suffix = " (hidden)"
                    // console.log("Hidden comment: #comment-" + commentId)
                } else {
                    const commentToHighlight = commentEle.getElementsByClassName("comment-text")[0];
                    commentToHighlight.classList.add("smfHighlight", "smfCmtLnk")

                    const parentAnswerRoot = commentEle.closest(".answer.js-answer");
                    const parentQuestionRoot = commentEle.closest(".question.js-question");
                    const parentRoot = parentAnswerRoot == null ? parentQuestionRoot : parentAnswerRoot;

                    // const parentPostCell = parentAnswerRoot == null ? parentQuestionRoot.getElementsByClassName("postcell")[0] : parentAnswerRoot.getElementsByClassName("answercell")[0];
                    // const parentPostCellHeight = parentPostCell.offsetHeight;
                    
                    const parentRootHeight = parentRoot.offsetHeight;
                    const windowHeight = window.innerHeight;
                    if (parentRootHeight > windowHeight * 0.7) {
                        // display the Navigate to comments button only if the post is longer than 70% of the window height
                        const voteCell = parentRoot?.getElementsByClassName("votecell")[0];
                        const btnExists = voteCell?.getElementsByClassName("smfAnsHasCmmts")[0]; // getElementById is only available in document
                        if (!btnExists) {
                            const scrollToCmts = document.createElement("button");
                            scrollToCmts.id = "smfScrollToCmts";
                            // scrollToCmts.textContent = "SMF 💬"
                            scrollToCmts.title = "You have posted comments in this post. Click to scroll to the comments"
                            scrollToCmts.classList.add("smfAnsHasCmmts", "s-btn", "s-btn__filled");
                            
                            const smfLogo = document.createElement("img");
                            smfLogo.src = logoImageUrl;
                            smfLogo.height = "20";
                            smfLogo.alt = "Stack Me First Logo";
                            smfLogo.classList.add("smfLogo");
                            scrollToCmts.appendChild(smfLogo); 

                            console.log("img Added")

                            scrollToCmts.addEventListener("click", () => {
                                scrollToTarget(parentId, "comments", 60);
                            });

                            voteCell?.appendChild(scrollToCmts);
                        }
                    }
                }

                commentList.push({ commentId, suffix, title: body, cmtParentId: parentId });
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
    let latestQuota_max, latestQuota_remaining
    const hlLinkQ = preferences.hlLinkQs;
    if (hlLinkQ) {
        const tokenData = await GetLocalTokenData();
        token = tokenData.token;
        if (token != "") {
            const stackAPI = new Api(token);
            const linkedQsAPI = await stackAPI.getLinkedQues(currURL, currentQid);
            const allLinkedQs = linkedQsAPI.myDetails;
            latestQuota_max = linkedQsAPI.latestQuota_max;
            latestQuota_remaining = linkedQsAPI.latestQuota_remaining;

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
                            if (isAuthor) {
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

    return { hlLinkQ, linkedQids, token, latestQuota_max, latestQuota_remaining };
}

function insertAfter(referenceNode, newNode) {
    // reference: https://stackoverflow.com/a/4793630/6908282
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}