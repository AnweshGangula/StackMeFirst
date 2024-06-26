<script>
  	import { onMount } from "svelte";
    import browser from "webextension-polyfill";
    import { pageTypeEnum } from "~/utils/constants";
    import Api from "~/utils/stackAPI";
    import { GetLocalTokenData, getUrlRootDomain } from "~/utils/utils";


  console.log("Getting Started");

  const urlParams = new URLSearchParams(window.location.search);
  let domain = urlParams.get('domain');

  let listOfJoinedCommunities;
  let getUserQuestions;
  let getUserAnswers;
  let getUserComments;

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

    console.log({listOfJoinedCommunities})

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

  async function GettingStartedContent(){
    
    const {sortedAccountByReputation} = await GettingStartedEvent();
    
    let gettingStartedSite = sortedAccountByReputation[0];

    if(domain){
      gettingStartedSite = sortedAccountByReputation.filter(s=>s.site_url.includes(domain))[0];
    } else {
      domain = getUrlRootDomain(gettingStartedSite.site_url);
    }

    const userId = gettingStartedSite.user_id;
    console.log({gettingStartedSite})

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

    console.log({getUserComments, getUserAnswers, getUserQuestions})

}

GettingStartedContent();

</script>

<div id="GettingStarted_Root">
  <h1>Getting Started</h1>

  {#if listOfJoinedCommunities}
    <ul>
      {#each listOfJoinedCommunities as site}
          <li>{site.site_name}</li>
      {/each} 
    </ul>
{/if}

  <p>Domain: {domain}</p>

  {#if getUserQuestions}
    <div id="getStartedQuestions">
      <h2>Questions to get started</h2>
      <p>
        {getUserQuestions.myDetails[0].link}
      </p>
      <p>
        {getUserQuestions.myDetails[0].title}
      </p>
    </div>
  {/if}

  {#if getUserAnswers}
  <div id="getStartedQuestions">
    <h2>Anwers to get started</h2>
    <p>
      {getUserAnswers.myDetails[0].answer_id}
    </p>
    <p>
      {getUserAnswers.myDetails[0].body}
    </p>
  </div>
  {/if}

  {#if getUserComments}
    <div id="getStartedQuestions">
      <h2>Comments to get started</h2>
      <p>
        {getUserComments.myDetails[0].comment_id}
      </p>
    </div>
  {/if}

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
</style>
