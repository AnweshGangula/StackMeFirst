<script>
	import browser from "webextension-polyfill";
	import StackContent from "./StackContent.svelte";

	import { defaultPreferances, pageTypeEnum } from "~/utils/constants";
	import { IsQuestion } from "~/utils/utils";

	export let pageType;
	export let linkQData;

	const currPref = GetPreferences();
	export let glCurrTab;
	let token;
	let linkedQ = [];
	let isQ;
	let warning = "Loading";
	let loading = warning == "Loading" ? "loading" : "";

	if(pageType == pageTypeEnum.sidebar){
		isQ=true;
		parseLinkQData(linkQData);
	}else{
		GetUpvotedLinks();
	}


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
		browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
			isQ = IsQuestion(tabs[0].url);
			if (isQ) {
				browser.tabs
					.sendMessage(tabs[0].id, { from: pageTypeEnum.popup, subject: "popupLinkQs" })
					.then((info) => {
						parseLinkQData(info);
						glCurrTab = tabs[0];
					})
					.catch((error) => {
						warning = "Error in fetching LinkQ data from contentScript:\n" + error.message;
					});
			}
		});
	}

	function parseLinkQData(info){
		if(!info?.token) throw new Error("Please login again using the login button above");

		token = info.token;
		const allLinkedQs = info.linkedQids;

						allLinkedQs.forEach((ques) => {
							let suffix = ques.isHidden + ques.isFavorite + ques.isAuthor;
							linkedQ.push({linQId: ques.linkJson.question_id.toString(), suffix, title: ques.linkJson.title});
						});

		if (!token) {
			warning = 'Click the "Login" button above to provide access to linked questions';
		}
	}

</script>

{#await currPref then Options}
	{#if isQ && Options.hlLinkQs}
		{#if token}
			<StackContent pageType={pageType} eleList={linkedQ} type="linkq" tab={glCurrTab} />
		{:else}
			<p id="linQLogin" class="featureOff {loading}">{warning}</p>
		{/if}
	{/if}
{/await}

<style>
	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}

	.loading {
		pointer-events: none;
	}

	.loading:after {
		overflow: hidden;
		display: inline-block;
		vertical-align: bottom;
		-webkit-animation: ellipsis steps(4, end) 900ms infinite;
		animation: ellipsis steps(4, end) 900ms infinite;
		content: "\2026";
		/* ascii code for the ellipsis character */
		width: 0px;
	}

	@keyframes ellipsis {
		to {
			width: 10px;
		}
	}

	@-webkit-keyframes ellipsis {
		to {
			width: 10px;
		}
	}
</style>
