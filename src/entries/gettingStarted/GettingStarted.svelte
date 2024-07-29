<script>
  	import { onMount } from "svelte";
    import DOMPurify from 'dompurify';
    import browser from "webextension-polyfill";
    import { constants, pageTypeEnum } from "~/utils/constants";
    import Api from "~/utils/stackAPI";
    import { GetLocalTokenData, getUrlRootDomain } from "~/utils/utils";
    import Loader from "../popup/Components/Loader.svelte";
    import Header from "~/lib/Header.svelte";


  const urlParams = new URLSearchParams(window.location.search);
  let domain = urlParams.get('domain');
  // meta sites are not returned in associated API call - except meta.stackexchange.com: https://meta.stackexchange.com/q/400995/381523
  if(domain?.startsWith("meta.") && domain !== "meta.stackexchange.com" ){
    domain = domain.replace("meta.", "")
  } else if (domain == "data.stackexchange.com"){
    domain = ""
  }

  let lineClamp = 3; // https://stackoverflow.com/a/57183208/6908282

  let listOfJoinedCommunities;
  let getUserQuestions;
  let getUserAnswers;
  let getUserComments;
  let getUserLinkQs;
  let allMyHiddenCommentPosts;
  let selectedSite;
  
  let reloadingCommunity = false;
  
  let apiCallsPerPage = constants.apiCallsPerPage; // number of API calls "Stack Me First" uses per page
  let remainingUses = "loading...";
  let totalAvaibaleUses = 10000/apiCallsPerPage;

  
  let stackAPI;

  async function GettingStartedEvent() {
    const tokenData = await GetLocalTokenData();
    const token = tokenData.token;
    const profileData = tokenData;
    const accountId = tokenData.accountId;

    if(!token){
      console.warn("Token not found. Please login");
      throw new Error('Please login above to fetch the information to help you get started');
    }

    stackAPI = new Api(token);
    const {
      myDetails: userAssociatedAccounts,
      latestQuota_max,
      latestQuota_remaining,
    } = await stackAPI.getUserAssociatedAccounts(accountId);

    const sortedAccountByReputation = userAssociatedAccounts.sort((a, b) => a.reputation > b.reputation ? -1 : 1);

    listOfJoinedCommunities = sortedAccountByReputation;

    // console.log({listOfJoinedCommunities})

    // browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
    // 	isQ = IsValidStackExchangeSite(tabs[0].url);
    // 	if (isQ) {
    // browser.tabs
    // 	.sendMessage(tabs[0].id, { from: pageTypeEnum.popup, subject: "popupLinkQs" })
    // 	.then((info) => {
    // 		parseLinkQData(info);
    // 		glCurrTab = tabs[0];
    // 	})
    // 	.catch((error) => {
    // 		warning = "Error in fetching LinkQ data from contentScript:\n" + error.message;
    // 	});

    // }
    // });

    return {
      sortedAccountByReputation,
      latestQuota_max,
      latestQuota_remaining,
    }
  }

  function OnDomainClick(e, site){
    
    selectedSite = site;
    reloadingCommunity = true;
    domain = getUrlRootDomain(site.site_url);
    GettingStartedContent(listOfJoinedCommunities).then(()=>{
      reloadingCommunity = false;
    });
  }

  function GetAffiliatedLink(postType, postId){
    const myAffiliateId = selectedSite.user_id;
    const siteUrl = selectedSite.site_url;

    let href = siteUrl + "/" + postType + "/" + postId + "/" + myAffiliateId;

    if(postType == "comment"){
      href = siteUrl + "/posts/comments/" + postId;
    }

    return href;
  }

  async function GettingStartedContent(listOfJoinedCommunities){
    
    // const {sortedAccountByReputation: listOfJoinedCommunities} = await GettingStartedEvent();
    
    selectedSite = listOfJoinedCommunities[0];

    if(domain){
      selectedSite = listOfJoinedCommunities.filter(s=>s.site_url.includes(domain))[0];
    } else {
      domain = getUrlRootDomain(selectedSite.site_url);
    }

    const userId = selectedSite.user_id;
    console.log({selectedSite})

    const tokenData = await GetLocalTokenData();
    const token = tokenData.token;

    if(!token){
      console.warn("Token not found. Please login");
      throw new Error('Please login to fetch the information to help you get started');
    }

    stackAPI = new Api(token);

    // TODO: get all communities joined by the user and display getting started for each site
    // NOTE: this needs account_id which is different from userID.
    // You can get account by gettin the userId of the current-site
    // https://api.stackexchange.com/docs/associated-users#ids=9303763&filter=default&run=true

    getUserQuestions = await stackAPI.getPostsByUserId(domain, userId);
    // const getUserPosts = await stackAPI.getPostsByUserId(domain, userId, "posts"); // this may or may not give both answers and questions
    getUserAnswers = await stackAPI.getPostsByUserId(domain, userId, "answers");
    getUserComments = await stackAPI.getPostsByUserId(domain, userId, "comments");
    selectedSite.totalComments = getUserComments.totalCount;

    const moreCommentQuestinos = getUserQuestions.myDetails.filter(q => {
      q.postType = "q";
      return (q.comment_count > 5  && q.comments.filter(c=>c.owner.user_id == userId))
    });
    const moreCommentAnswers = getUserAnswers.myDetails.filter(a => {
      a.postType = "a";
      return (a.comment_count > 5 && a.comments.filter(c=>c.owner.user_id == userId));
    });

    const allMoreCommentPosts = [...moreCommentAnswers, ...moreCommentQuestinos];

    allMyHiddenCommentPosts = allMoreCommentPosts.filter(p=>{

      const hiddenComments = p.comments.sort((a,b)=>{
        return b.score - a.score || a.creation_date - b.creation_date
      }).slice(5);

      const myHiddenComments = hiddenComments.filter(c=> c.owner.user_id == userId);

      return myHiddenComments.length > 0;

    });

    const questionIds = getUserQuestions.myDetails
    // .filter(q=>q.score < 10) // filter smaller score questions - hopefully it might have less linked questions
    .map(q=>q.question_id)
    .slice(0,6).join(";");

    getUserLinkQs = questionIds.length > 0 ? await stackAPI.getLinkedQues("https://" + domain, questionIds) : {latestQuota_max: stackAPI.latestQuota_max, latestQuota_remaining: stackAPI.latestQuota_remaining, myDetails: []};

    const gettingStartedData = {listOfJoinedCommunities, getUserComments, getUserAnswers, getUserQuestions, getUserLinkQs, allMyHiddenCommentPosts}
    // console.log({gettingStartedData})

		remainingUses = Math.floor(stackAPI.latestQuota_remaining/apiCallsPerPage) ?? 0;
    totalAvaibaleUses = Math.floor(stackAPI.latestQuota_max/apiCallsPerPage) ?? 10000


    return gettingStartedData
}

const getStartedContent = GettingStartedEvent().then(async ()=>{
    await GettingStartedContent(listOfJoinedCommunities);
  })

</script>

<div id="GettingStarted_Root" style="max-width: 1200px; margin: auto;">

  <Header pageType={pageTypeEnum.gettingStarted} />

  <div id="headerGettingStarted">
    <h1 style="margin: 0;">🚀 Getting Started</h1>
    <p>Remaining uses <b>today</b> (approx): <strong>{remainingUses}</strong>/{totalAvaibaleUses}</p>
  </div>

  <div style="border-bottom: 1px solid lightgray;">
    <p>
      Welcome to Stack Me First,
    </p>
    <p>
      If you're using the Stack Me First browser extension for the first time, this guide will help you get started with using it and how you can use it. This extension is meant to be used by user who use any of the Stack Exchange communities extensively. 
      <span>
        To use this page, you will need to "Login"  using the above button. And if you're already logged in, you will see your profile icon from Stack-Exchange.
      </span>
    </p>
    <p>
      Once you're signed in, whenever you visit this page <i>(either using the Right-Click context menu or from the "Getting started" button in the popup and the sidebar)</i>, you will see the list of communities you have joined below. And a list of suggested Questions, Answers or Comments that you can get started with. 
    </p>
    <p>
      You can click on any one of the communities listed in the table to update the suggested content accordingly.
    </p>
    <blockquote style="">There are additional references to help you get started in the <a href="https://github.com/AnweshGangula/StackMeFirst/tree/main?tab=readme-ov-file#getting-started" target="_blank">Readme File</a> of the Github Repository</blockquote>
    <!-- <hr /> -->
  </div>

  {#await getStartedContent}
    <Loader />
  {:then result}
    {#if listOfJoinedCommunities.length > 0 }
    {@const siteHost = new URL(selectedSite.site_url).hostname.split(".stackexchange.com")[0].split(".com")[0]}
      <div style="display: flex; gap: 10px; padding: 2px 5px">
        <div style="">
          <h2>Communities you joined:</h2>
          <small>(click on a row to fetch data from the respective community)</small>
            <table id="communitiesTable">
              <tr style="text-wrap: nowrap; text-align: center">
                <th>Community</th>
                <th>Reputation</th>
                <th># Questions</th>
                <th># Answers</th>
                <th># Comments</th>
              </tr>
              {#each listOfJoinedCommunities as site}
                <tr
                  title="{site.site_url == selectedSite.site_url ? "" : "Click to fetch data"}"
                  on:click={(e)=>OnDomainClick(e, site)}
                  class = {"joinedComminity " + (domain == getUrlRootDomain(site.site_url) ? 'highlight': '')}
                  style="padding: 5px 2px; border-radius: 5px">
                  <td class="cellCommunity" style="min-width: 150px;">{site.site_name}</td>
                  <td class="cellNumbers cellReputation">{site.reputation}</td>
                  <td class="cellNumbers cellQuestion_count">{site.question_count}</td>
                  <td class="cellNumbers cellAnswer_count">{site.answer_count}</td>
                  <td 
                    class="cellNumbers cellSite_url {site.site_url == selectedSite.site_url ? "" : "loadComments"}"
                    > 
                    {site.site_url == selectedSite.site_url ? (selectedSite.totalComments ?? "loading...") : "🔃"}
                  </td>
                </tr>
              {/each} 
            </table>
        </div>

        <div id="gettingStartedCommunityData">
            <!-- <p>Domain: {domain}</p> -->

            <div>
              <p>
                Below are some example questions, answers & comments that we found from your profile in <b>{selectedSite.site_name}</b>.
              </p>
              <i>
                (Note that, the list will only show a <b>maximum of 5</b> results)
              </i>
              <hr />
            </div>
            
            {#if reloadingCommunity}
              <Loader />
            {:else}

            {#if (
              getUserQuestions.myDetails.length == 0
              && getUserAnswers.myDetails.length == 0
              && getUserComments.myDetails.length == 0
              && getUserLinkQs.myDetails.length == 0
              )}
              <p style="background-color: firebrick; color: white; padding: 5px 8px;">
                No Data found in <strong>{domain}</strong>
              </p>
            {:else}
      
                {#if getUserQuestions.myDetails.length > 0}
                  {@const questions = getUserQuestions.myDetails.slice(0, 5)}
                  <div class="getStartedQuestions">
                    <details open>
                      <summary>
                        <h2>Questions to get started</h2>
                        <i><b style="background-color: bisque;padding: 3px;border-radius: 3px;">({questions.length})</b></i>
                      </summary>

                      <blockquote>
                        Use <a href={"https://data.stackexchange.com/" +  siteHost + "/revision/1636995/2260979?userId=" + selectedSite.user_id + "&run=true"} target="_blank">this stackexchange query</a> to see more than 5 links
                      </blockquote>

                      <ul>
                        {#each questions as ques}
                          <li class="question">
                            <a href={GetAffiliatedLink("q", ques.question_id)} target="_blank">
                              {ques.title}
                            </a>
                          </li>
                        {/each} 
                      </ul>
                    </details>
                  </div>
                {/if}
          
                {#if getUserAnswers.myDetails.length > 0}
                {@const answers = getUserAnswers.myDetails.slice(0, 5)}
                <div class="getStartedQuestions">
                  <details>
                    <summary>
                      <h2>Answers to get started</h2>
                      <i><b style="background-color: bisque;padding: 3px;border-radius: 3px;">({answers.length})</b> answer body is limited to {lineClamp} lines</i>
                    </summary>

                    <blockquote>
                      Use <a href={"https://data.stackexchange.com/" +  siteHost + "/revision/1849271/2254572?userId=" + selectedSite.user_id + "&run=true"} target="_blank">this stackexchange query</a> to see more than 5 links
                    </blockquote>

                    <ul>
                      {#each answers as ans}
                        <li class="link answer" style="--lineClamp: {lineClamp}">
                          <a 
                            href={GetAffiliatedLink("a", ans.answer_id)}
                            target="_blank"
                            >
                            {ans.answer_id}
                          </a>
                          <span class="bodyText">
                            {@html DOMPurify.sanitize(ans.body)}
                            <!-- {ans.body_markdown} -->
                          </span>
                        </li>
                      {/each} 
                    </ul>

                  </details>
                </div>
                {/if}
          
                {#if getUserComments.myDetails.length > 0}
                  {@const userComments = getUserComments.myDetails.slice(0, 5)}
                  <div class="getStartedQuestions">
                    <details>
                      <summary>
                        <h2>Comments to get started</h2>
                        <i><b style="background-color: bisque;padding: 3px;border-radius: 3px;">({userComments.length})</b></i>
                      </summary>

                      <blockquote>
                        Use <a href={"https://data.stackexchange.com/" +  siteHost + "/revision/1849270/2254571?UserId=" + selectedSite.user_id + "&MinCommentsScore=0&run=true"} target="_blank">this stackexchange query</a> to see more than 5 links
                      </blockquote>
                      <ul>
                        {#each userComments as cmt}
                          <li class="link comment">
                            <a 
                              href={GetAffiliatedLink("comment", cmt.comment_id)}
                              target="_blank"
                            >
                              {cmt.comment_id}
                            </a>
                            <span class="bodyText">
                              {@html DOMPurify.sanitize(cmt.body)}
                              <!-- {@html cmt.body_markdown} -->
                            </span>
                          </li>
                        {/each} 
                      </ul>
                    </details>
                  </div>
                {/if}
              {/if}

              {#if getUserLinkQs.myDetails.length > 0}
                {@const linkQs = getUserLinkQs.myDetails.filter(q => q.score < 20).slice(0, 5)}
                <div class="getStartedLinkQ">
                  <details>
                    <summary>
                      <h2>Questions linked to Your Questions</h2>
                      <i><b style="background-color: bisque;padding: 3px;border-radius: 3px;">({linkQs.length})</b></i>
                    </summary>

                    <blockquote>
                      Use <a href={"https://data.stackexchange.com/" +  siteHost + "/revision/1849607/2254570?UserId=" + selectedSite.user_id + "&run=true"} target="_blank">this stackexchange query</a> to see more than 5 links
                    </blockquote>
                    
                    <blockquote>Stack Me First can also help you identify questions that are linked to any questions you might have posted. This helps you in identifying a post you created if you come across a linked post in your Google search or any other source</blockquote>

                    <ul>
                      {#each linkQs as ques}
                        <li class="question">
                          <a href={GetAffiliatedLink("q", ques.question_id)} target="_blank">
                            {ques.title}
                          </a>
                        </li>
                    {/each} 
                    </ul>

                </div>
              {/if}

              {#if ( selectedSite && (
                getUserQuestions.myDetails.length > 0
                || getUserAnswers.myDetails.length > 0
                || getUserComments.myDetails.length > 0
                || getUserLinkQs.myDetails.length > 0
                || allMyHiddenCommentPosts.slice(0, 5).length > 0
                ))}
                {@const hiddenCommentPosts = allMyHiddenCommentPosts.slice(0, 5)}
                <div class="getStartedHiddenComments {hiddenCommentPosts.length == 0 ? 'noContent' : ''} ">
                  <details>
                    <summary>
                      <h2>
                        {#if hiddenCommentPosts.length == 0}
                          <span style="color: firebrick;">No</span>
                        {/if}
                        Posts with your hidden comments
                      </h2>
                      <i><b style="background-color: bisque;padding: 3px;border-radius: 3px;">({hiddenCommentPosts.length})</b></i>
                    </summary>
                    <blockquote>
                      Use <a href={"https://data.stackexchange.com/" +  siteHost + "/revision/1849760/2260980?UserId=" + selectedSite.user_id + "&run=true"} target="_blank">this stackexchange query</a> to see more than 5 links
                    </blockquote>
                    
                    {#if hiddenCommentPosts.length == 0}
                    <p style=" background: firebrick; color: white; padding: 5px; border-radius: 5px; ">No Posts found with hidden comments</p>
                    {/if}
                    
                    <blockquote><b>Feature Overview: </b>If there are any posts in which you have added comments, and the total number of comments in that posts are more than 5, then it's possible that your comment/s might get hidden by the stack exchange <a href="https://stackoverflow.blog/2009/04/23/comments-top-n-shown/" target="_blank">top n comments</a> algorithm. And <b>Stack Me First</b> can also help you identify such hidden comments, if there are any.</blockquote>

                    {#if hiddenCommentPosts.length > 0}
                      <ul>
                        {#each hiddenCommentPosts as post}
                          {@const postId = post.postType == "q" ? post.question_id : post.answer_id} 
                          {@const postType = post.postType == "q" ? "Question" : "Answer"} 
                          {@const postContent = post.postType == "q" ? post.title : post.body_markdown} 
                          <li class="link">
                            <a href={GetAffiliatedLink(post.postType, postId)} target="_blank">
                              {postId}
                            </a>
                            <b>({postType})</b>
                            <span class="postcontent" style="--lineClamp: {lineClamp}">
                              {postContent}
                            </span>
                          </li>
                      {/each} 
                      </ul>
                    {:else}
                      <div style="border-top: 1px solid lightgray; padding: 3px 12px; margin: 12px 4px;background: antiquewhite;">
                        
                        <!-- adding comment below mentioning that all the posts are not searched with API - to reduce API usage -->
                        <p>We searched for hidden comments in recent posts to reduce API usage and could not find any. But you might encounter some posts while you use the extension.</p>
                      </div>
                    {/if}

                    <!-- {#if selectedSite.site_name == "Stack Overflow"} -->

                    <!-- <p>For a better search, you can use the query in the following link</p> -->
                    <!-- <blockquote>Note: You need to add your stackoverflow <code>user_id</code> for this to work. You can find the user_id in the url of your stack overflow profile</blockquote> -->
                    <!-- <a href={"https://data.stackexchange.com/" +  siteHost + "/revision/1849760/2260980?UserId=" + selectedSite.user_id + "&run=true"} target="_blank">Find posts that have hidden comments added by user</a> -->

                  <!-- {/if} -->

                </div>
              {/if}

            {/if}
          </div>
      </div>
    {:else}
      <p>
        You haven't joined in any Stack Exchange Communities. Stack Me First is useful if you have been using any of the Stack Exchange communities.
      </p>
    {/if}

  {:catch error}
      <p style="background: firebrick; color: white; background: firebrick; text-align: center;">     
        {error.message}
      </p>
  {/await}




</div>

<style>
  #Sidebar_Root {
    --toastWidth: 24rem;
    --toastBackground: blanchedalmond;
    --toastColor: #424242;
    --toastBarBackground: brown;
    --toastContainerTop: auto;
    --toastContainerRight: 1rem;
    --toastContainerBottom: 2rem;
    /* --toastContainerLeft: calc(50vw - 8rem); */
  }

  #GettingStarted_Root blockquote {
    padding: 5px;
    margin: 5px 15px;
    margin-left: 30px;
    border-left: 3px solid gray;
    background: beige
  }

  #headerGettingStarted {
    position: sticky; 
    top: 0px;
    z-index: 10;
    background-color: white;
    border-bottom: 1px solid lightgray;
  }
  summary h2 {
    display: inline;
    /* margin: 0; */
  }
  #communitiesTable {
    /* width: 250px; */
    table-layout: fixed;
    max-width: 450px;
  }

  #communitiesTable .cellNumbers{
    text-align: center;
  }

  #communitiesTable .cellCommunity{
    min-width: 200px;
    padding: 2px 5px;
  }

  #communitiesTable .cellSite_url.loadComments{
    cursor: pointer;
  }

  #gettingStartedCommunityData {
    --smfBackgroundColor: darkorange;
    --smfBorderColor: darkorange;

    max-height: 830px;
    overflow: hidden;
    overflow-y: auto;

    border: 5px solid darkorange;
    border-right: none;
    border-width: 1px 0px 1px 5px;
    padding-left: 5px;
    z-index: 2;
    margin: 5px;
    margin-left: -12px; /* this help is making it look like the table and getting started content are related */
    border-radius: 5px;
  }

  #gettingStartedCommunityData summary {
    position: sticky;
    top: 0px;
    z-index: 9;
    background: white;
    border-bottom: 1px solid lightgray;
  }

  #gettingStartedCommunityData .link {
    margin-top: 8px;
  }

  #gettingStartedCommunityData .link a{
    display: block; 
    background-color: aliceblue; 
    padding: 2px 5px; 
    border-radius: 5px;
  }

  #gettingStartedCommunityData .link a:hover {
    background-color: bisque;
  }

  #gettingStartedCommunityData .link .bodyText{
    position: relative;
    left: 15px;
  }
  #gettingStartedCommunityData .link.answer .bodyText {

    /* max-height: ; */
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: var(--lineClamp); /* number of lines to show */
            line-clamp: var(--lineClamp); 
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }

  .getStartedHiddenComments .postcontent {
    /* max-height: ; */
    /* background-color: bisque; */
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: var(--lineClamp); /* number of lines to show */
            line-clamp: var(--lineClamp); 
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }

  .getStartedHiddenComments.noContent h2 {
    /* color: firebrick; */
  }

  #communitiesTable {
    position: sticky;
    top: 75px;
  }
  #communitiesTable th {
    padding: 8px 4px;
    text-align: left;
    background-color: #04AA6D;
    color: white;
  }
  
  #communitiesTable tr:nth-child(even):not(:hover):not(.highlight){background-color: #f2f2f2;}

  .joinedComminity:not(.highlight):hover{
    background-color: bisque;
  }
  .highlight {
    background-color: darkorange;
    color: white;
    font-weight: bold;
  }
</style>
