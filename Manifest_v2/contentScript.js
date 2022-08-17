const currUser = document.getElementsByClassName("s-user-card")[0];
const allAnswers = document.getElementsByClassName('answer');
const allComments = document.getElementsByClassName("comment-body");
const answersHeader = document.getElementById('answers-header');
const currURL = window.location.href // .at(-1)
const website = window.location.host;
const isStackOverflow = website == "stackoverflow.com"

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
                from: "contentScript",
                subject: "needLogin",
                content: {
                    currUser: currUser,
                }
            }, function () {
                // console.log("sending message");
            });
        }
        else {
            let answerCount = highlightAnswer(allAnswers, config.hlAns, config.srtAns);
            let commentCount = highlightComments(allComments, config.hlCmnts);
            chrome.runtime.sendMessage({
                //  reference: https://stackoverflow.com/a/20021813/6908282
                from: "contentScript",
                subject: "loggedIn",
                content: {
                    answerCount: answerCount,
                    commentCount: commentCount
                }
            }, function () {
                // console.log("sending message");
            });

            // Listen for messages from the popup.
            chrome.runtime.onMessage.addListener((msg, sender, response) => {
                console.log("message received")
                // Reference: https://stackoverflow.com/a/20023723/6908282
                // First, validate the message's structure.
                if ((msg.from === 'popup') && (msg.subject === 'popupDOM')) {
                    console.log({ "abc": answerCount })
                    // Collect the necessary data. 
                    // (For your specific requirements `document.querySelectorAll(...)`
                    //  should be equivalent to jquery's `$(...)`.)
                    var popupContent = {
                        answerCount: answerCount,
                    };

                    // Directly respond to the sender (popup), 
                    // through the specified callback.
                    response(popupContent);
                }
            });
        }
    }
})

function highlightAnswer(answers, hlAns, srtAns) {
    let answerCount = 0;
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
                    answerToHighlight.style.cssText = "padding: 5px; outline: 2px solid darkgreen; border-radius: 5px; margin: 20px 0;"
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
    return answerCount;
}

function highlightComments(comments, hlCmnts) {
    let commentCount = 0;
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
    return commentCount;
}

function insertAfter(referenceNode, newNode) {
    // reference: https://stackoverflow.com/a/4793630/6908282
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
