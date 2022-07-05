
currUser = document.getElementsByClassName("s-user-card")[0];
allAnswers = document.getElementsByClassName('answer');
allComments = document.getElementsByClassName("comment-body");
answersHeader = document.getElementById('answers-header');
currURL = window.location.href // .at(-1)
let answerCount = 0;
let commentCount = 0;

let answerExists = highlightAnswer(allAnswers);
let commentExists = highlightComments(allComments);

if (answerExists || commentExists) {
    chrome.runtime.sendMessage({
        //  reference: https://stackoverflow.com/a/20021813/6908282
        answerCount: answerCount,
        commentCount: commentCount
    });
}

function highlightAnswer(answers) {
    let bool = false
    for (let answer of answers) {
        userDetails = answer.querySelectorAll('.user-details');
        userHTML = userDetails[userDetails.length - 1];
        answerUser = userHTML.children.item(0);
        if (answerUser.href == currUser.href) {
            answerToHighlight = answer;
            insertAfter(answersHeader, answerToHighlight);
            answerToHighlight.style.cssText = "padding: 5px;outline: 2px solid darkgreen;border-radius: 5px; margin: 20px 0;"
            bool = true
            answerCount++
        }

        if (currURL.indexOf(answer.dataset.answerid) > -1) {
            // if the user clicks on a link to a specific answer, scroll that into view
            answer.scrollIntoView();
        }
    }
    return bool;
}

function highlightComments(comments) {
    let bool = false;
    for (let comment of comments) {
        commentUser = comment.children[1].children[0];
        if (commentUser.href == currUser.href) {
            commentToHighlight = comment;
            commentToHighlight.style.cssText = "padding: 5px;outline: 2px solid darkgreen;border-radius: 5px;"
            bool = true
            commentCount++
        }
    }
    return bool;
}

function insertAfter(referenceNode, newNode) {
    // reference: https://stackoverflow.com/a/4793630/6908282
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
