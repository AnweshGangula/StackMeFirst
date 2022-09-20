# StackMeFirst

"Stack Me First" is a browser Extension (currently only available in [Microsoft Edge][1] & [Firefox][2]) that highlights & lists

- Answers posted by the current user in the currently visible page of the Stack Overflow.
- Comments posted by the current user in the currently visible page of the Stack Overflow

Optionally, you can also use the login button in the popup to highlight & list

- Answers hidden due to pagination of multiple answers
- Comments hidden under "show more comments"
- Linked questions that have been Upvoted/Bookmarked/Posted by the logged in user.

> Note: this does not store or share any data externally.

## Instructions

In order to see this plugin in action, open any StackOverflow question where you have posted at least one answer. Note that you need to be logged in to StackOverflow.com in your browser.

> Disclaimer: this plugin doesn't store/share your user information in any means. the logged in user is identified using the StackOverflow navigation bar or **optionally** by using the "login" button from popup (discussed below).

Once the question is opened in StackOverflow, you'll notice that the answer/s posted by you will be highlighted with a "green" border and they will be automatically brought to the top of the answers list.

Check out the [screenshot](./Assets/Screenshots/Highlight_Sort%20answers.png) for a [question][3] where I have posted an answer _(you probably need a different question)_.\
Even though the StackOverflow sort is set to "Highest score" & it has another answer with a score of 5, my answer is listed at the top and highlighted with green border.

This is just the beginning of what this plugins provides you. As you navigate across various questions, you might noticed various highlights depending on your interaction with the question like - Upvote, Bookmark, Comment, Answer. Lets talk about the full set of features below:

## Features

Other than what you see automatically reflect on the answer (like green border answers/comments), the primary feature of the plugin is the popup screen which lists all the relevant links and information together. Below is a screenshot and its feature list - for a sample question based on my account and interactions:

![Screenshot of Popup window of "Stack Me First" plugin](./Assets/Screenshots/Popup%20Instructions.png)

### Default features (no OAuth)

The points highlighted in orange are default features available for you (considering that you are logged in to StackOverflow.com in your browser)

1. This is the Plugin Icon which has a text hint showing the number of Answers & Comments submitted by me.
   - 2A,4C - indication `2 Answers` & `4 Comments`
2. `n` answer/s posted by you - This is the list of answers posted by me for the current question and their respective links
   - clicking on the link will scroll the respective answer into view.
   - [Answers reference image](./Assets/Screenshots/Highlight_Sort%20answers.png)
3. `n` comment/s posted by you - This is the list of comments posted by me for the current question and their respective links
   - clicking on the link will scroll the respective answer into view.
   - [Comments reference image](./Assets/Screenshots/Highlight%20comments.png)
4. User Preferences - These are the user preferences which you can set to enable or disable respectively.
   - You can also set the same preferences from the options window as well by
     - Chrome/Edge - right-clicking on the plugin icon > Extension options
     - Firefox - right click > manage extension > (addon page) three dots ... > Options
5. When you open any question that is posted by you, you'll see this badge in the popup indicated you are the author - with a link to sroll to the question at the top.
6. In some cases, you might notice a suffix attached to a answer/comment link called `(hidden)`. This means that the

   - respective answer is present in the other pages - when there are lots of answers to a question OR
   - respective comment is hidden under "show more comments"
   - [Comments reference image](./Assets/Screenshots/Highlight%20comments.png)

   So clicking on these links will open a new page navigating you to the respective comment/answer

### Oauth Features

> Other than the features mentioned above, you can also get enhanced insights & features by authenticating the plugin to read additional information using [StackExchange API](https://api.stackexchange.com/docs). Below are the related features

7. Login/Logout button - This login button opens a new window which prompts you to login to StackOverflow using your preferred option.
8. Profile Picture - Once you're logged in successfully, your profile picture from StackOverflow will be displayed, indicating that the plugin now has enhanced features.
9. `n` linkq/s ... - this is a list of linked question where you
   1. a. have upvoted the respective question _(no highlight)_ OR
   2. b. have bookmarked (_previously called favorite_) the respective question _(highlighted in yellow with a star)_ OR
   3. c. are either **the author** of the respective question _(highlighted in green)_ OR
   - [Linked Questions reference image](./Assets/Screenshots/Highlight%20comments.png)

# Contribution

Checkout the contribution instructions in the [following file](./Contribution.md)

[1]: https://microsoftedge.microsoft.com/addons/detail/stack-me-first/andilefigneejkadafmdfcmjdnabfbhi
[2]: https://addons.mozilla.org/en-US/firefox/addon/stack-me-first/
[3]: https://stackoverflow.com/q/20686440/6908282
