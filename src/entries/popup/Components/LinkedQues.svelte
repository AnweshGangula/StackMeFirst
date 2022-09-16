<script>
	import browser from "webextension-polyfill";
	import StackContent from "./StackContent.svelte";

	import Api from "~/utils/stackAPI";
	import { QuesIdUrl, GetLocalToken } from "~/utils/utils";
	import { defaultPreferances } from "~/utils/constants";

	const currPref = GetPreferences();
	let glCurrTab;
	const upvotedLinks = GetUpvotedLinks();

	async function GetPreferences() {
		var sotrageOpts = new Promise(function (resolve, reject) {
			//  reference: https://stackoverflow.com/a/58491883/6908282
			browser.storage.sync.get({ stackMeData: defaultPreferances }).then(function (result) {
				// You can set default for values not in the storage by providing a dictionary:
				// reference: https://stackoverflow.com/a/26898749/6908282
				// if stackMeData is not found, use defaultPreferances for a first time user
				resolve(result.stackMeData);
			});
		});
		const savedPref = await sotrageOpts;
		return savedPref;
	}

	async function GetUpvotedLinks() {
		let loggedIn = false;
		// TODO: convert this - send message to Popup and highlight linked question in website and return id's
		let linkedQ = [];
		await GetLocalToken().then(async function (result) {
			const token = result;
			if (token != "") {
				loggedIn = true;
				await browser.tabs.query({ active: true, lastFocusedWindow: true }).then(async function (tabs) {
					glCurrTab = tabs[0];
					const quesId = QuesIdUrl(glCurrTab.url);

					const stackApi = new Api(token);
					const allLinkedQs = await stackApi.getLinkedQues(quesId);

					allLinkedQs.forEach((ques) => {
						if (ques.upvoted) {
							linkedQ.push(ques.question_id.toString());
						}
					});
				});
			}
		});
		return { linkedQ, loggedIn };
	}
</script>

{#await currPref then Options}
	{#if Options.hlLinkQs}
		{#await upvotedLinks}
			<p>Loading Upvoted Linked Questions...</p>
		{:then result}
			{#if result.loggedIn}
				<StackContent eleList={result.linkedQ} type="linkq" tab={glCurrTab} />
			{:else}
				<p>Login to Stack Overflow to get Linked Question Upvoted by you</p>
			{/if}
		{/await}
	{:else}
		<p id="linkQsOff" class="featureOff">Highlighting Links is disabled</p>
	{/if}
{/await}

<style>
	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}
</style>
