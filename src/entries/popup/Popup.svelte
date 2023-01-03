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

	export let stackData;

	let warningText;
	let warningType = new Set();
	let glCurrTab;
	let answerList, commentList;

	// Once the DOM is ready...
	const dispDOM = displayHTML().then(() => restore_options(pageTypeEnum.popup));

	async function displayHTML() {
		console.log("check");
		await browser.tabs.query({ active: true, lastFocusedWindow: true }).then(async function (tabs) {
			// get current Tab - https://stackoverflow.com/a/29151677/6908282
			let activeTab = tabs[0];
			glCurrTab = tabs[0];

			if (IsStackOverflow(activeTab.url)) {
				await browser.tabs.sendMessage(tabs[0].id, { from: pageTypeEnum.popup, subject: "popupDOM" }).then((info) => {
					console.log(info);
					extractMyStack(info, tabs);
				});
				// if (website != "stackoverflow.com" || website != "extensions") {
				// // commenting this because the options page is not working as expected in edge://extensions/ page
				//     console.log(website);
				//     document.getElementById("config").style.display = "none";
				// }
			} else {
				warningText = "! Please open a Stack Overflow question to use this addin.";
				warningType.add("warn");
			}
		});
	}

	function extractMyStack(info, tabs = []) {
		const currTab = tabs[0] ?? pageTypeEnum.dock;
		const warn = CheckWarnings(currTab, info);
		console.log({currTab})
		warningText = warn.warningText;
		warningType = warn.warningType;

		if (warningType.has("warn")) {
			return;
		}
		answerList = info.answerList;
		commentList = info.commentList;

		console.log({answerList})
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
		<div id="myStack">
			<StackContent eleList={answerList} type="answer" tab={glCurrTab} />
			<StackContent eleList={commentList} type="comment" tab={glCurrTab} />
			<LinkedQues />
			<hr />
		</div>
		<Preferences pageType={pageTypeEnum.popup} />
	{:catch error}
    	<p style="color: red">{error.message}</p>
	{/await}
</main>

<style>
	:global(body) {
		font-family: "Inter", Helvetica Neue, Arial, Helvetica, sans-serif;
		width: 350px;
		/* height: 0px; this doesn't show scrollbar is height is close to scroll */
		margin: 0 25px; /* Scrollbar is overlapping with content */
	}
	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 2px;
		border: none;
		background: lightgray;
	}
</style>
