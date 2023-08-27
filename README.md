Quick Links: [Demo video](https://www.youtube.com/watch?v=Srcy3kOH3Ic) | [Instructions](#instructions) | [Features](#features) | [Known Bugs](#known-bugs) | [Contribution](#contribution)

<a href="https://www.buymeacoffee.com/AnweshGangula" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 35px !important;" ></a>

# StackMeFirst

> Checkout the [YouTube video](https://www.youtube.com/watch?v=Srcy3kOH3Ic) for the demo of v5

"Stack Me First" is a browser Extension (currently only available in [Google Chrome][1], [Microsoft Edge][2] & [Firefox][3]) that highlights & lists

- Answers posted by the current user in the currently visible page of the Stack Overflow & all other Stack Exchange communities.
- Comments posted by the current user in the currently visible page of the Stack Overflow & all other Stack Exchange communities

Optionally, you can also use the login button in the popup to highlight & list

- Answers hidden due to pagination of multiple answers
- Comments hidden under "show more comments"
- Linked questions that have been Upvoted/Bookmarked/Posted by the logged in user.

> Note: this does not store or share any data externally.\
> Disclaimer: The linked questions are affiliated with my account - which is associated with "Booster" badge - https://stackoverflow.com/help/badges/261/booster
## Instructions

In order to see this plugin in action, open any StackOverflow question where you have posted at least one answer. Note that you need to be logged in to StackOverflow.com in your browser.

> Disclaimer: this plugin doesn't store/share your user information in any means. the logged in user is identified using the StackOverflow navigation bar or **optionally** by using the "login" button from popup (discussed below).

Once the question is opened in StackOverflow, you'll notice that the answer/s posted by you will be highlighted with a "green" border and they will be automatically brought to the top of the answers list.

Check out the [screenshot][4] for a [question][5] where I have posted an answer _(you probably need a different question)_.\
Even though the StackOverflow sort is set to "Highest score" & it has another answer with a score of 5, my answer is listed at the top and highlighted with green border.

This is just the beginning of what this plugins provides you. As you navigate across various questions, you might noticed various highlights depending on your interaction with the question like - Comment, Answer, [Linked Question][6] - Upvote, Bookmark. Lets talk about the full set of features below:

## Features

Other than what you see automatically reflect on the answer (like green border answers/comments), the primary feature of the plugin is the popup screen which lists all the relevant links and information together. Below is a screenshot and its feature list - for a sample question based on my account and interactions:

<img src="./Assets/Screenshots/Popup%20Instructions.png" alt="Screenshot of Popup window of 'Stack Me First' plugin" width="300"/>

### Default features (*without Login*)

The points highlighted in orange are default features available for you (considering that you are logged in to StackOverflow.com in your browser)

1.  This is the Plugin Icon which has a text hint showing the number of Answers & Comments submitted by me.
    - 2A,4C - indication `2 Answers` & `4 Comments`
2.  `n` answer/s posted by you - This is the list of answers posted by me for the current question and their respective links
    - clicking on the link will scroll the respective answer into view.
    - [Answers reference image][4]
3.  `n` comment/s posted by you - This is the list of comments posted by me for the current question and their respective links
    - clicking on the link will scroll the respective answer into view.
    - [Comments reference image][7]
4.  User Preferences - These are the user preferences which you can set to enable or disable respectively.
    - You can also set the same preferences from the options window as well by
      - Chrome/Edge - right-clicking on the plugin icon > Extension options
      - Firefox - right click > manage extension > (addon page) three dots ... > Options
5.  When you open any question that is posted by you, you'll see this badge in the popup indicated you are the author - with a link to sroll to the question at the top.
6.  In some cases, you might notice a suffix attached to a answer/comment link called `(hidden)`. This means that the

    - respective answer is present in the other pages - when there are lots of answers to a question OR
    - respective comment is hidden under "show more comments"
    - [Comments reference image][7]

    So clicking on these links will open a new page navigating you to the respective comment/answer

### Advanced Features (*with Login*)

> Other than the features mentioned above, you can also get enhanced insights & features by authenticating the plugin to read additional information using [StackExchange API][8]. Below are the related features

7.  Login/Logout button - This login button opens a new window which prompts you to login to StackOverflow using your preferred option.
8.  Profile Picture - Once you're logged in successfully, your profile picture from StackOverflow will be displayed, indicating that the plugin now has enhanced features.
9.  `n` linkq/s ... - this is a list of linked question where you
    1.  a. have upvoted the respective question _(no highlight)_ OR
    2.  b. have bookmarked (_previously called favorite_) the respective question _(highlighted in yellow with a star)_ OR
    3.  c. are either **the author** of the respective question _(highlighted in green)_ OR
    - [Linked Questions reference image][6]

## Known Bugs

I'm aware of few of the issue with the current version of the plugin, You can check out the [issue page of this repository][9] for more details. Feel free to add more to the list.

- [Questions with more than 100 LINKED QUESTIONS don't work as expected][10]
  - Reference: [Pagination doesn't work for certain API routes/functions][11]
  - Reference: [API returns the same content in paginated response][16]
- [Questions with more than 100 ANSWERS don't work as expected][12]
- [Favorites not being highlighted][13]
- [Linked questions not being highlighted for few questions][14]

## Existing Alternate Extensions:

There are a few extensions which you can consider as alternatives to Stack Me First, which give you different features:

- [StackOverflow Power User](https://chrome.google.com/webstore/detail/stackoverflow-power-user/dghoicnlchonhhkccfmjpjconhpajhdg)
- [StackEye](https://chrome.google.com/webstore/detail/stackeye/pihfndpmcafdecheofkjfkadecoogigm)
- [StackOverflow Answer](https://chrome.google.com/webstore/detail/stackoverflow-answer/bmlkdgmiaemiaopodggkhfblhmefimoi)
- [Upvote First for StackOverflow](https://chrome.google.com/webstore/detail/upvote-first-for-stackove/jafbgebfjkfejghbdeohaadmfghkmjlo)

# Contribution

Checkout the contribution or local development instructions in the [./Contributon.md][15] file

# SEO Keywords/sentences:

- chrome extension or firefox extension to highlight & list my upvoted stack overflow answers
- chrome extension or firefox extension to highlight & list my stack overflow linked questions
- chrome extension or firefox extension to highlight & list my stack overflow comments

[1]: https://chrome.google.com/webstore/detail/stack-me-first/pmjhehdfjfahnlgdblnhhfcimegodmnj
[2]: https://microsoftedge.microsoft.com/addons/detail/stack-me-first/andilefigneejkadafmdfcmjdnabfbhi
[3]: https://addons.mozilla.org/en-US/firefox/addon/stack-me-first/
[4]: ./Assets/Screenshots/Highlight_Sort%20answers.png
[5]: https://stackoverflow.com/q/20686440/6908282
[6]: ./Assets//Screenshots/Highlight%20Linked%20Questions.png
[7]: ./Assets/Screenshots/Highlight%20comments.png
[8]: https://api.stackexchange.com/docs
[9]: https://github.com/AnweshGangula/StackMeFirst/issues
[10]: https://github.com/AnweshGangula/StackMeFirst/issues/43
[11]: https://meta.stackexchange.com/questions/307314/pagination-doesnt-work-for-certain-api-routes-functions
[12]: https://github.com/AnweshGangula/StackMeFirst/issues/45
[13]: https://meta.stackexchange.com/q/385726/381523
[14]: https://meta.stackexchange.com/q/383720/381523
[15]: ./Contribution.md
[16]: https://meta.stackexchange.com/q/382363/381523
