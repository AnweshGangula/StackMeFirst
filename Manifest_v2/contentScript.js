const currURL = window.location.href // .at(-1)
const website = window.location.host;
const isStackOverflow = website == "stackoverflow.com"


if (isStackOverflow) {
    const currUser = document.querySelector('[data-gps-track="profile_summary.click()"]');
    // const currUser = document.getElementsByClassName("s-user-card")[0]; // this is not correct if user I not logged in at this URL: https://stackoverflow.com/questions
    let myAnsList;
    let myCmmtList;

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
    } else {
        console.log("ABC")
        const allAnswers = document.getElementsByClassName('answer');
        const allComments = document.getElementsByClassName("comment");
        const answersHeader = document.getElementById('answers-header');

        const queryParams = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        const isSorted = queryParams.answertab != undefined;

        const DOM_Opts = { currUser, answersHeader, isSorted }

        let defaultConfig = {
            // You can set default for values not in the storage by providing a dictionary:
            // reference: https://stackoverflow.com/a/26898749/6908282
            hlAns: true,
            srtAns: true,
            hlCmnts: false,
        }

        chrome.storage.sync.get({ 'stackMeData': defaultConfig }, result => {
            let userConfig = result.stackMeData;
            // You can set default for values not in the storage by providing a dictionary:
            // reference: https://stackoverflow.com/a/26898749/6908282


            myAnsList = highlightAnswer(allAnswers, userConfig, DOM_Opts);
            myCmmtList = highlightComments(allComments, userConfig, DOM_Opts);
            chrome.runtime.sendMessage({
                //  reference: https://stackoverflow.com/a/20021813/6908282
                from: "contentScript",
                subject: "loggedIn",
                content: {
                    answerCount: myAnsList == "N/A" ? "?" : myAnsList.length,
                    commentCount: myCmmtList == "N/A" ? "?" : myCmmtList.length
                }
            }, function () {
                // console.log("sending message");
            });

        })
    }

    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        // Reference: https://stackoverflow.com/a/20023723/6908282
        // First, validate the message's structure.
        if ((msg.from === 'popup') && (msg.subject === 'popupDOM')) {
            // send data to list answers in popup
            var popupContent = {
                metaData: {
                    currUser: currUser,
                },
                answerList: myAnsList,
                commentList: myCmmtList,
            };

            response(popupContent); // this sends popupContent dict to SetPopupContent function in popup.js
        }
    });
}

function highlightAnswer(answers, userConfig, DOM_Opts) {
    const hlAns = userConfig.hlAns;
    const srtAns = userConfig.srtAns;
    const isSorted = DOM_Opts.isSorted;
    const answersHeader = DOM_Opts.answersHeader;
    const currUser = DOM_Opts.currUser;

    let answerList = [];
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
                answerList.push(answer.id);
            }

            if (currURL.indexOf(answer.dataset.answerid) > -1) {
                // if the user clicks on a link to a specific answer, scroll that into view
                answer.scrollIntoView();
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
            commentUser = comment.getElementsByClassName("comment-user")[0];
            if (commentUser.href == currUser.href) {
                commentToHighlight = comment.getElementsByClassName("comment-text")[0];
                commentToHighlight.style.cssText = "padding: 5px; outline: 2px solid darkgreen; border-radius: 5px;"
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

function scrollToTarget(eleId, type, headerHeight = 40) {
    // reference: https://stackoverflow.com/a/67647864/6908282
    // this function is being used in popupjs for sctoll to the answer/comment clicked dby the user
    let element = document.getElementById(eleId);
    element.classList.add("highlighted-post");

    if (type == "comment") {
        element = document.getElementById(eleId).getElementsByClassName("comment-text")[0];
        element.style.backgroundColor = 'var(--yellow-100)' // comments have a transition for backgroundColor. So settimeout below is technically not necessary
    }
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition - headerHeight;

    window.scrollBy({
        top: offsetPosition,
        behavior: "smooth"
    });

    setTimeout(function () {
        element.classList.remove("highlighted-post");
        element.style.backgroundColor = ''
    }, 3000);
}
