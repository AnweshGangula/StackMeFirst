<script>
  	import { onMount } from "svelte";
    import browser from "webextension-polyfill";
    import { constants, pageTypeEnum } from "~/utils/constants";
    import Api from "~/utils/stackAPI";
    import { GetLocalTokenData, getUrlRootDomain } from "~/utils/utils";
    import Loader from "../popup/Components/Loader.svelte";
    import Header from "~/lib/Header.svelte";


  console.log("Getting Started");

  const urlParams = new URLSearchParams(window.location.search);
  let domain = urlParams.get('domain');
  // meta sites are not returned in associated API call - except meta.stackexchange.com: https://meta.stackexchange.com/q/400995/381523
  domain = (domain?.startsWith("meta.") && domain !== "meta.stackexchange.com" )? domain.replace("meta.", "") : domain;

  let listOfJoinedCommunities;
  let getUserQuestions;
  let getUserAnswers;
  let getUserComments;
  let reloadingCommunity = false;
  let remainingUses = "loading...";
  let selectedSite;

  async function GettingStartedEvent() {
    const tokenData = await GetLocalTokenData();
    const token = tokenData.token;
    const profileData = tokenData;
    const accountId = tokenData.accountId;

    const stackAPI = new Api(token);
    const {
      myDetails: userAssociatedAccounts,
      latestQuota_max,
      latestQuota_remaining,
    } = await stackAPI.getUserAssociatedAccounts(accountId);

    const sortedAccountByReputation = userAssociatedAccounts.sort((a, b) => a.reputation > b.reputation ? -1 : 1);

    listOfJoinedCommunities = sortedAccountByReputation;

    // console.log({listOfJoinedCommunities})

    // browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
    // 	isQ = IsStackOverflow(tabs[0].url);
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
    const token = tokenData.token ?? "";

    let stackAPI = new Api(token);

    // TODO: get all communities joined by the user and display getting started for each site
    // NOTE: this needs account_id which is different from userID.
    // You can get account by gettin the userId of the current-site
    // https://api.stackexchange.com/docs/associated-users#ids=9303763&filter=default&run=true

    getUserQuestions = await stackAPI.getPostsByUserId(domain, userId);
    // const getUserPosts = await stackAPI.getPostsByUserId(domain, userId, "posts"); // this may or may not give both answers and questions
    getUserAnswers = await stackAPI.getPostsByUserId(domain, userId, "answers");
    getUserComments = await stackAPI.getPostsByUserId(domain, userId, "comments");

    const gettingStartedData = {listOfJoinedCommunities, getUserComments, getUserAnswers, getUserQuestions}
    console.log({gettingStartedData})

    const apiCallsPerPage = constants.apiCallsPerPage; // number of API calls "Stack Me First" uses per page
		remainingUses = Math.floor(getUserComments.latestQuota_remaining/apiCallsPerPage) ?? 0;


    return gettingStartedData
}

const getStartedContent = GettingStartedEvent().then(async ()=>{
    await GettingStartedContent(listOfJoinedCommunities);
  })

</script>

<div id="GettingStarted_Root" style="">

  <Header pageType={pageTypeEnum.gettingStarted} />

  <div id="headerGettingStarted">
    <h1 style="margin: 0;">Getting Started</h1>
    <p>Remaining Quota (today): {remainingUses}</p>
  </div>

  <div>
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
      Once you're signed in, Whenever you visit this page <i>(either using the Right-Click context menu or from the "Getting started" button in the popup and the sidebar)</i>, you will see the list of communities you have joined below. And a list of suggested Questions, Answers or Comments that you can get started with. 
    </p>
    <p>
      You can click on any one of the communities listed in the table to update the suggested content accordingly.
    </p>
    <hr />
  </div>
  {#await getStartedContent}
    <Loader />
  {:then result}
    <div style="display: flex; gap: 10px; padding: 2px 5px">
      <div style="">
        <h2>Communities you joined:</h2>
        <small>(click to fetch data from the community)</small>
        {#if listOfJoinedCommunities}
          <table id="communitiesTable">
            <tr style="text-wrap: nowrap; text-align: center">
              <th>Community</th>
              <th>Reputation</th>
              <th># Questions</th>
              <th># Answers</th>
            </tr>
            {#each listOfJoinedCommunities as site}
              <tr
                on:click={(e)=>OnDomainClick(e, site)}
                class = {"joinedComminity " + (domain == getUrlRootDomain(site.site_url) ? 'highlight': '')}
                style="padding: 5px 2px; border-radius: 5px">
                <td style="min-width: 150px;">{site.site_name}</td>
                <td style="text-align: center">{site.reputation}</td>
                <td style="text-align: center">{site.question_count}</td>
                <td style="text-align: center">{site.answer_count}</td>
              </tr>
            {/each} 
          </table>
        {/if}
      </div>

      <div id="gettingStartedCommunityData">
          <!-- <p>Domain: {domain}</p> -->

          {#if reloadingCommunity}
            <Loader />
          {:else}

          {#if (
            getUserQuestions.myDetails.length == 0
            || getUserAnswers.myDetails.length == 0
            || getUserComments.myDetails.length == 0
            )}
            <p style="background-color: firebrick; color: white; padding: 5px 8px;">
              No Data found in <strong>{domain}</strong>
            </p>
          {:else}
    
              {#if getUserQuestions.myDetails.length > 0}
                <div id="getStartedQuestions">
                  <details open>
                    <summary>
                      <h2>Questions to get started</h2>
                    </summary>

                    <ul>
                      {#each getUserQuestions.myDetails.slice(0, 5) as ques}
                        <li>
                          <a href={GetAffiliatedLink("q", ques.question_id)}>
                            {ques.title}
                          </a>
                        </li>
                      {/each} 
                    </ul>
                  </details>
                </div>
              {/if}
        
              {#if getUserAnswers.myDetails.length > 0}
              <div id="getStartedQuestions">
                <details open>
                  <summary>
                    <h2>Anwers to get started</h2>
                    <i>limited to 4 lines</i>
                  </summary>

                  <ul>
                    {#each getUserAnswers.myDetails.slice(0, 5) as ans}
                      <li class="link answer">
                        <a 
                          href={GetAffiliatedLink("a", ans.answer_id)}
                          >
                          {ans.answer_id}
                        </a>
                        <span>
                          {@html ans.body}
                        </span>
                      </li>
                    {/each} 
                  </ul>

                </details>
              </div>
              {/if}
        
              {#if getUserComments.myDetails.length > 0}
                <div id="getStartedQuestions">
                  <details open>
                    <summary>
                      <h2>Comments to get started</h2>
                    </summary>
                    <ul>
                      {#each getUserComments.myDetails.slice(0, 5) as cmt}
                        <li class="link">
                          <a 
                            href={GetAffiliatedLink("comment", cmt.comment_id)}
                          >
                            {cmt.comment_id}
                          </a>
                          <span>
                            {@html cmt.body}
                          </span>
                        </li>
                      {/each} 
                    </ul>
                  </details>
                </div>
              {/if}
            {/if}
          {/if}
      </div>

    </div>
  {:catch error}
      <p style="color: red">{error.message}</p>
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


  #headerGettingStarted {
    position: sticky; 
    top: 0px;
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
    max-width: 350px;
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

  #gettingStartedCommunityData .link.answer{

    /* max-height: ; */
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 4; /* number of lines to show */
            line-clamp: 4; 
    -webkit-box-orient: vertical;
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
