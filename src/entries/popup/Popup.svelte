<script>
	import browser from "webextension-polyfill";
	// browser.storage.sync.clear(); // use this while development to clear any existing options
	// let console = browser.extension.getBackgroundPage().console;
	import Notification from "./Components/Notification.svelte";
	import { restore_options, CheckWarnings } from "./popupUtils";
	import { IsStackOverflow } from "~/utils/utils";
	import { pageTypeEnum } from "~/utils/constants";
	import StackContent from "./Components/StackContent.svelte";
	import Header from "~/lib/Header.svelte";
	import Preferences from "~/lib/Preferences.svelte";
	import Loader from "./Components/Loader.svelte";
	import LinkedQues from "./Components/LinkedQues.svelte";

	import popupMixpanel from "./mixpanelPopup";
	popupMixpanel();

	export let stackData;

	let warningText;
	let warningType = new Set();
	let glCurrTab;
	let answerList, commentList;

	// Once the DOM is ready...
	const dispDOM = displayHTML().then(() => restore_options(pageTypeEnum.popup));

	async function displayHTML() {
		const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true })
		
		// get current Tab - https://stackoverflow.com/a/29151677/6908282
		let activeTab = tabs[0];
		glCurrTab = tabs[0];

		if (IsStackOverflow(activeTab.url)) {
			const info = await browser.tabs.sendMessage(tabs[0].id, { from: pageTypeEnum.popup, subject: "popupDOM" })
			// console.log(info);
			extractMyStack(info, tabs);
			// if (website != "stackoverflow.com" || website != "extensions") {
			// // commenting this because the options page is not working as expected in edge://extensions/ page
			//     console.log(website);
			//     document.getElementById("config").style.display = "none";
			// }
		} else {
			warningText = "! Please open a Stack Overflow question to use this addin.";
			warningType.add("warn");
		}
	}

	function extractMyStack(info, tabs = []) {
		const currTab = tabs[0] ?? pageTypeEnum.sidebar;
		const warn = CheckWarnings(currTab, info);
		warningText = warn.warningText;
		warningType = warn.warningType;

		if (warningType.has("warn")) {
			return;
		}
		answerList = info.answerList;
		commentList = info.commentList;

		return "extraction done";

		// return new Promise(function (resolve) {
		// 	setTimeout(resolve);
		// });
	}
</script>

<Header />
<main>
	{#await dispDOM}
		<Loader />
	{:then result}
		<Notification {warningType} {warningText} {glCurrTab} />

		{#if warningText == "! Login to Stack Overflow to highlight your answers"}
			<!-- If user not logged in to Stack Overflow don't render anything -->
		{:else}
			<div id="myStack">
				<StackContent eleList={answerList} type="answer" tab={glCurrTab} />
				<StackContent eleList={commentList} type="comment" tab={glCurrTab} />
				<LinkedQues />
			</div>
		{/if}
		<Preferences pageType={pageTypeEnum.popup} />
	{:catch error}
    	<p style="color: red">{error.message}</p>
	{/await}
</main>

<style>
	:global(body) {
		font-family: "Inter", Helvetica Neue, Arial, Helvetica, sans-serif;
		width: 450px;
		/* height: 0px; this doesn't show scrollbar is height is close to scroll */
		margin: 0; /* Scrollbar is overlapping with content */
	}
	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 2px;
		border: none;
		background: lightgray;
	}
</style>
