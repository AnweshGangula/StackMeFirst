<script>
	import browser from "webextension-polyfill";
	import StackContent from "./StackContent.svelte";

	import { defaultPreferances } from "~/utils/constants";

	const currPref = GetPreferences();
	let glCurrTab;
	let token;
	let linkedQ = [];
	GetUpvotedLinks();
	console.log(token);

	async function GetPreferences() {
		var sotrageOpts = new Promise(function (resolve, reject) {
			// TODO: Replace Promise with Async-Await
			//  reference: https://stackoverflow.com/a/58491883/6908282
			browser.storage.sync.get({ stackMeData: defaultPreferances }).then(function (result) {
				// You can set default for values not in the storage by providing a dictionary:
				// reference: https://stackoverflow.com/a/26898749/6908282
				// if stackMeData is not found, use defaultPreferances for a first time user
				if (result) {
					resolve(result.stackMeData);
				} else {
					reject(new Error("throw"));
				}
			});
		});
		const savedPref = await sotrageOpts;
		return savedPref;
	}

	function GetUpvotedLinks() {
		let loggedIn = false;

		browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
			browser.tabs.sendMessage(tabs[0].id, { from: "popup", subject: "popupLinkQs" }).then((info) => {
				console.log(info);
				token = info.token;
				loggedIn = token;
				glCurrTab = tabs[0];
				const allLinkedQs = info.linkedQids;

				allLinkedQs.forEach((ques) => {
					if (ques.linkJson.upvoted) {
						const suffix = ques.hidden;
						linkedQ.push(ques.linkJson.question_id.toString() + suffix);
					}
				});
			});
		});
	}
</script>

{#await currPref then Options}
	{#if Options.hlLinkQs}
		{#if token}
			<StackContent eleList={linkedQ} type="linkq" tab={glCurrTab} />
		{:else}
			<p class="featureOff">Login to Stack Overflow to get Linked Question Upvoted by you</p>
		{/if}
	{/if}
{/await}
<p id="linkQsOff" class="featureOff" />

<style>
	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}
</style>
