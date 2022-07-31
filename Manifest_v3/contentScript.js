
currUser = document.getElementsByClassName("s-user-card")[0];
allAnswers = document.getElementsByClassName('answer');
allComments = document.getElementsByClassName("comment-body");
answersHeader = document.getElementById('answers-header');
currURL = window.location.href // .at(-1)
website = window.location.host;
isStackOverflow = website == "stackoverflow.com"
let answerCount = 0;
let commentCount = 0;

const queryParams = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
const isSorted = queryParams.answertab != undefined;

let defaultOptions = {
    // You can set default for values not in the storage by providing a dictionary:
    // reference: https://stackoverflow.com/a/26898749/6908282
    hlAns: true,
    srtAns: true,
    hlCmnts: false,
}
chrome.storage.sync.get({ 'stackMeData': defaultOptions }, result => {
    let config = result.stackMeData;
    // You can set default for values not in the storage by providing a dictionary:
    // reference: https://stackoverflow.com/a/26898749/6908282
    if (isStackOverflow) {
        if (currUser == undefined) {
            chrome.runtime.sendMessage({
                //  reference: https://stackoverflow.com/a/20021813/6908282
                type: "needLogin",
                content: {
                    currUser: currUser,
                }
            }, function () {
                // console.log("sending message");
            });
        }
        else {
            let answerExists = highlightAnswer(allAnswers, config.hlAns, config.srtAns);
            let commentExists = highlightComments(allComments, config.hlCmnts);
            chrome.runtime.sendMessage({
                //  reference: https://stackoverflow.com/a/20021813/6908282
                type: "loggedIn",
                content: {
                    answerCount: answerCount,
                    commentCount: commentCount
                }
            }, function () {
                // console.log("sending message");
            });
        }
    }
})

function highlightAnswer(answers, hlAns, srtAns) {
    let bool = false
    if (hlAns || srtAns) {
        for (let answer of answers) {
            userDetails = answer.querySelectorAll('.user-details');
            userHTML = userDetails[userDetails.length - 1];
            answerUser = userHTML.children.item(0);
            if (answerUser.href == currUser.href) {
                answerToHighlight = answer;
                if (!isSorted && srtAns) {
                    insertAfter(answersHeader, answerToHighlight);
                }
                if (hlAns) {
                    answerToHighlight.style.cssText = "padding: 5px;outline: 2px solid darkgreen;border-radius: 5px; margin: 20px 0;"
                }
                bool = true
                answerCount++
            }

            if (currURL.indexOf(answer.dataset.answerid) > -1) {
                // if the user clicks on a link to a specific answer, scroll that into view
                answer.scrollIntoView();
            }
        }
    }
    return bool;
}

function highlightComments(comments, hlCmnts) {
    let bool = false;
    if (hlCmnts == true) {
        for (let comment of comments) {
            commentUser = comment.children[1].children[0];
            if (commentUser.href == currUser.href) {
                commentToHighlight = comment;
                commentToHighlight.style.cssText = "padding: 5px; outline: 2px solid darkgreen; border-radius: 5px;"
                bool = true
                commentCount++
            }
        }
    }
    else {
        commentCount = "?"
    }
    return bool;
}

function insertAfter(referenceNode, newNode) {
    // reference: https://stackoverflow.com/a/4793630/6908282
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
