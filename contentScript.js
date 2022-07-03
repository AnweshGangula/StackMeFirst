
currUser = document.getElementsByClassName("s-user-card")[0];
allAnswers = document.getElementsByClassName('answer');
answersHeader = document.getElementById('answers-header');
currURL = window.location.href // .at(-1)
for (let answer of allAnswers) {
    userDetails = answer.querySelectorAll('.user-details');
    userHTML = userDetails[userDetails.length - 1];
    userAnchor = userHTML.children.item(0);
    if (userAnchor.href == currUser.href) {
        divToHighlight = answer;
        insertAfter(answersHeader, divToHighlight);
        divToHighlight.style.cssText = "padding: 5px;outline: 2px solid darkgreen;border-radius: 5px; margin: 20px 0;"
    }

    if (currURL.indexOf(answer.dataset.answerid) > -1) {
        // if the user clicks on a link to a specific answer, scroll that into view
        answer.scrollIntoView();
    }
}

function insertAfter(referenceNode, newNode) {
    // reference: https://stackoverflow.com/a/4793630/6908282
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
